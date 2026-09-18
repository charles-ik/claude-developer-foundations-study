#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3.10 or later is required. Install it from https://www.python.org/downloads/.'
  printf 'Press Enter to close.'
  read -r reply
  exit 1
fi
python3 practice_server.py --open
if [ "$?" -ne 0 ]; then
  printf 'Could not start the studio. Press Enter to close.'
  read -r reply
fi
