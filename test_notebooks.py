"""Small offline regression check for the study notebooks."""

import json
import os
from pathlib import Path

from study_support import claude_client, claude_model


def test_notebooks() -> None:
    os.environ["OPENROUTER_API_KEY"] = "test-key"
    client = claude_client()
    assert str(client.base_url) == "https://openrouter.ai/api/"
    assert claude_model().startswith("anthropic/")
    client.close()

    notebooks = sorted(Path("notebooks").glob("*.ipynb"))
    assert len(notebooks) == 5

    for path in notebooks:
        document = json.loads(path.read_text())
        cells = [cell for cell in document["cells"] if cell["cell_type"] == "code"]
        sources = ["".join(cell["source"]) if isinstance(cell["source"], list) else cell["source"] for cell in cells]

        compile("\n\n".join(sources), str(path), "exec")
        assert any("client = claude_client()" in source for source in sources)
        assert any("client.messages.create(" in source for source in sources)
        assert max(len(source.splitlines()) for source in sources) <= 12


if __name__ == "__main__":
    test_notebooks()
    print("Validated five API-backed notebooks.")
