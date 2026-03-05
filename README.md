# Zonnova

Zonnova is a notebook-first idea workspace with an autonomous agent pipeline.

## Run Locally

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Amazon Nova Setup

Required environment:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # if using temporary credentials
export AWS_REGION=us-east-1
```

Optional model overrides:

```bash
export ZONNOVA_NOVA_PRO_MODEL_ID=us.amazon.nova-pro-v1:0
export ZONNOVA_NOVA_LITE_MODEL_ID=us.amazon.nova-lite-v1:0
```

Your AWS principal must have `bedrock:Converse` access to these model IDs.

## Test the Pipeline

Create a run:

```bash
curl -s -X POST http://localhost:3000/api/agent-runs \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"studio-lab","ideaText":"Build an anonymous notebook that turns notes into specs, plans, and demos."}'
```

Poll a run:

```bash
curl -s http://localhost:3000/api/agent-runs/<runId>
```

List runs:

```bash
curl -s "http://localhost:3000/api/agent-runs?workspaceId=studio-lab"
```

The run stages execute in order:

1. `normalize_idea`
2. `generate_spec`
3. `generate_plan`
4. `build_app`
5. `run_qa`
6. `record_demo`
