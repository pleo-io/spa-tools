# Attempt to run in parallel
MAKEFLAGS += -j3

all: test build

build: cursor-deploy/README.md cursor-deploy/dist/main/index.js
build: translation-cursor-deploy/README.md translation-cursor-deploy/dist/main/index.js
build: post-preview-urls/README.md post-preview-urls/dist/main/index.js
build:
	./node_modules/.bin/prettier -w .

%/dist/main/index.js: %/index.ts utils.ts node_modules Makefile
	./node_modules/.bin/tsup $< --out-dir $(dir $@) --config tsup.config.ts

%/README.md: %/action.yml node_modules
	cd $(dir $<) && ../node_modules/.bin/action-docs --update-readme --no-banner

test: node_modules
	./node_modules/.bin/jest

lint: node_modules
	./node_modules/.bin/prettier --check .

node_modules: package.json
	if ! test -d node_modules; then pnpm install; fi

.PHONY: all build test
