#!/bin/bash

set -e

npm run lint
npm run build
cp -r dist .build/dist
git checkout build
mkdir build
cp -r .build/dist/* build/
