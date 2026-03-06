.PHONY: dev build lint preview install

dev:
	npm run dev

build:
	npm run build

lint:
	npx tsc --noEmit

preview:
	npm run preview

install:
	npm install
