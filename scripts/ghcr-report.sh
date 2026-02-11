#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-easternkite/guildops}"
LIMIT="${2:-100}"
MODE="${3:-weekly}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required" >&2
  exit 1
fi

JSON="$(gh run list -R "$REPO" --workflow "Publish Docker Images (GHCR)" -L "$LIMIT" --json databaseId,headBranch,event,status,conclusion,createdAt)"

if [[ "$MODE" == "raw" ]]; then
  echo "$JSON"
  exit 0
fi

jq -r --arg mode "$MODE" '
  def bucket($m):
    if $m == "monthly" then (.createdAt[0:7])
    else (.createdAt[0:10])
    end;

  group_by(bucket($mode))
  | map({
      period: (.[0] | bucket($mode)),
      total: length,
      success: map(select(.conclusion == "success")) | length,
      failure: map(select(.conclusion == "failure")) | length,
      main_push: map(select(.event == "push" and .headBranch == "main")) | length,
      tag_push: map(select(.event == "push" and (.headBranch | test("^v[0-9]+\\.[0-9]+\\.[0-9]+")))) | length,
      manual: map(select(.event == "workflow_dispatch")) | length
    })
  | ("period,total,success,failure,main_push,tag_push,manual"),
    (.[] | [.period,.total,.success,.failure,.main_push,.tag_push,.manual] | @csv)
' <<<"$JSON"
