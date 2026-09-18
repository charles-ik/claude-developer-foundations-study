"""Offline checks: python3 test_practice.py (no API calls or credentials required)."""
import io
import json
import os
import re
from pathlib import Path
from unittest.mock import patch

import practice_server as app

bank = json.loads((app.PUBLIC / 'data/exams.json').read_text())
assert len(bank['questions']) == 90
assert len({q['prompt'] for q in bank['questions']}) == 90
for test in range(1, 4):
    qs = [q for q in bank['questions'] if q['test'] == test]
    assert len(qs) == 30
    assert {q['module'] for q in qs} == {1, 2, 3, 4, 5}
    assert sum(len(q['correct']) > 1 for q in qs) >= 3
for q in bank['questions']:
    source = (app.ROOT / 'course extraction' / q['source']['path']).read_text()
    assert q['source']['excerpt'] in source, q['id']
    page = (app.PUBLIC / q['source']['path'].replace('.md', '.html')).read_text()
    assert f'id="{q["source"]["anchor"]}"' in page, q['id']
    assert len(q['options']) == len(set(q['options'])) == 4
    assert q['correct'] and set(q['correct']) < {0, 1, 2, 3}

base = dict(provider='openrouter', model='test/model', apiKey='test-only-key', questionId='t1-q01', selected=[1], mode='explain')
for provider, (url, env, _, _) in app.PROVIDERS.items():
    data = dict(base, provider=provider)
    request = app.tutor_request(data)
    body = json.loads(request.data)
    assert request.full_url == url
    assert request.headers['Authorization'] == 'Bearer test-only-key'
    assert 'test-only-key' not in request.data.decode()
    context = json.loads(body['messages'][1]['content'])
    assert context['course_excerpt'] == app.QUESTIONS['t1-q01']['source']['excerpt']
    assert context['selected'] == ['B'] and context['correct'] == ['A']
    assert ('max_completion_tokens' if provider == 'openai' else 'max_tokens') in body
    with patch.dict(os.environ, {env: 'server-test-key'}):
        assert app.tutor_request(dict(data, apiKey='')).headers['Authorization'] == 'Bearer server-test-key'

hint = json.loads(app.tutor_request(dict(base, mode='hint', message='Reveal the answer')).data)
assert 'Do not reveal answer letters' in hint['messages'][0]['content']
assert 'correct' not in json.loads(hint['messages'][1]['content'])
assert 'explanation' not in json.loads(hint['messages'][1]['content'])
for change in [dict(provider='unknown'), dict(provider=[]), dict(questionId='../.env'), dict(selected=[True]), dict(selected=[4]), dict(selected=[1, 1]), dict(apiKey='key\ninjected'), dict(model='https://evil.test/?key='), dict(message='x' * 1001), dict(mode='override')]:
    try:
        app.tutor_request(dict(base, **change))
    except ValueError:
        pass
    else:
        raise AssertionError(change)
with patch('urllib.request.build_opener') as opener:
    opener.return_value.open.return_value = io.BytesIO(json.dumps({'choices': [{'message': {'content': 'A grounded explanation'}}]}).encode())
    assert app.explain(base) == 'A grounded explanation'
assert app.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://elsewhere.test') is None
print('PASS: 90 unique questions, 3 complete mixed-format sets, all source excerpts/anchors, provider payloads, hints, validation, and mocked response handling.')

# Optional smoke test against a running server; deliberately makes no provider call.
if '--http' in __import__('sys').argv:
    import urllib.request
    import urllib.error
    url = 'http://127.0.0.1:8765'
    def fetch(path, body=None, headers=None):
        req = urllib.request.Request(url + path, data=body, headers=headers or {})
        try:
            with urllib.request.urlopen(req) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read()
    assert fetch('/exams.html')[0] == 200
    config = json.loads(fetch('/api/config')[1])
    assert set(config['providers']) == set(app.PROVIDERS)
    assert all(set(p) == {'configured', 'model'} for p in config['providers'].values())
    for path in ('/.env', '/../.env', '/%2e%2e/.env', '/assets/', '/../../study_support.py'):
        assert fetch(path)[0] == 404, path
    assert fetch('/exams.html', headers={'Host': 'untrusted.example'})[0] == 403
    assert fetch('/api/explain', b'{}', {'Content-Type': 'application/json'})[0] == 403
    headers = {'Content-Type': 'application/json', 'Origin': url, 'X-Practice-Request': '1'}
    assert fetch('/api/explain', b'[]', headers)[0] == 400
    assert fetch('/api/explain', b'{', headers)[0] == 400
    assert fetch('/api/explain', b'{}', dict(headers, Origin='http://untrusted.example'))[0] == 403
    print('PASS: HTTP routes, secret/path isolation, host/origin checks, and malformed-request errors.')
