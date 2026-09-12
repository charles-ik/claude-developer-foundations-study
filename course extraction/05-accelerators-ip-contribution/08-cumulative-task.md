# 08 Cumulative Task

> Source: [Developer Module 5](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3rtcsmg1kllky/Developer_M5_vF2.html)  
> Extraction status: **Complete — 2 of 2 screens archived**

## Screen manifest

| Screen | Title | Exact content link |
| ---: | --- | --- |
| 21 | [Cumulative task: Find all three, explain each, write the correction](#screen-21--cumulative-task-find-all-three-explain-each-write-the-correction) | [S17](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3rtcsmg1kllky/Developer_M5_vF2.html#S17) |
| 22 | [Cumulative task: assemble and verify the corrected deployment](#screen-22--cumulative-task-assemble-and-verify-the-corrected-deployment) | [S18](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3rtcsmg1kllky/Developer_M5_vF2.html#S18) |

## Screen 21 — Cumulative task: Find all three, explain each, write the correction

> Exact content: [S17](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3rtcsmg1kllky/Developer_M5_vF2.html#S17)

*Cumulative · All topics · 6 min*

### Cumulative task: Find all three, explain each, write the correction

Below is a runnable packaged accelerator deployed across platforms. There are three planted defects: one in the packaging layer, one in the deployment-and-versioning layer, and one in the multi-component boundary layer. Your task is to find all three.

**The deployment as shipped**

```python
# Packaged code-review accelerator, deployed for a regulated AWS customer
def build_agent():
    return Agent(
        model="opus",
        system_prompt=SYSTEM_PROMPT,
        repo_path="/home/acme/checkout",
        tools=[read_file, run_linter],
    )

deploy(platform="amazon_bedrock", identity=aws_role_arn)

# multi-component step: Claude Code task fetches a customer page
fetched = code_task.run(fetch_url=customer_page)
next_call(input=fetched)
```

*Carry your three corrected lines into the next screen, where you assemble and verify the fixed deployment.*

In your own words, identify all three defects.

---

## Screen 22 — Cumulative task: assemble and verify the corrected deployment

> Exact content: [S18](https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/3rtcsmg1kllky/Developer_M5_vF2.html#S18)

*Cumulative · All topics · 6 min*

### Cumulative task: assemble and verify the corrected deployment

You have identified three defects across this module. Now assemble the fix: in your own words, describe what each defect was, what you changed, and why the corrected version is deployable. Then review the corrected code below and confirm your reasoning holds.

When you are ready, reveal the model answer.

**The corrected deployment**

```python
def build_agent(repo_path):                   # parameterized for reuse
    return Agent(
        model="us.anthropic.claude-opus-4-8",              # pinned full Bedrock model ID
        system_prompt=SYSTEM_PROMPT,
        repo_path=repo_path,                  # set per engagement
        tools=[read_file, run_linter],
    )

deploy(platform="amazon_bedrock", identity=aws_role_arn,
       retain_previous_pinned_version=True)   # rollback target kept

fetched = code_task.run(fetch_url=customer_page)
next_call(input=treat_as_data(fetched))       # untrusted -> data, not instructions

# verify before promoting: gate the version through the bundled eval
assert eval_suite.run(model="us.anthropic.claude-opus-4-8") >= baseline_score
```

**Model answer:** The first defect was a hardcoded repository path. Parameterizing it restores reuse: a new engagement sets the value rather than editing the loop. The second defect was a moving model alias. Pinning the full Bedrock model ID (with the anthropic. prefix) with a retained previous version restores controlled rollout and gives a rollback target if the new version regresses. The third defect was fetched content passed directly as instructions. Wrapping it in treat_as_data() closes the trust boundary: content from an untrusted source is treated as data, not as something the agent should act on. The eval assertion gates promotion on a proven baseline score before the version ships.

All three defects landed · pass  
I missed one or more · retry

