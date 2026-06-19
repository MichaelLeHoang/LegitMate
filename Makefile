.PHONY: help install install-api install-extension dev dev-api dev-extension build test test-api typecheck lint-api

API_DIR = services/api
API_VENV = $(API_DIR)/.venv
API_UVICORN = $(API_VENV)/bin/uvicorn
API_PORT ?= 8000
EXTENSION_PORT ?= 5173
PORTS_SELECTED ?= 0

help:
	@printf "LegitMate commands:\n"
	@printf "  make dev              Start the API and extension dev servers\n"
	@printf "  make dev-api          Start the FastAPI dev server\n"
	@printf "  make dev-extension    Start the extension Vite dev server\n"
	@printf "  make install          Install Node and API dependencies\n"
	@printf "  make build            Build the extension\n"
	@printf "  make test             Run extension and API tests\n"
	@printf "  make typecheck        Typecheck the extension\n"
	@printf "  make lint-api         Run API linting\n"
	@printf "\nOverride preferred ports with API_PORT=8000 EXTENSION_PORT=5173.\n"

install: install-extension install-api

install-extension:
	npm install

install-api: $(API_UVICORN)

$(API_UVICORN): $(API_DIR)/pyproject.toml
	cd $(API_DIR) && python3 -m venv .venv
	cd $(API_DIR) && .venv/bin/pip install -e ".[dev]"

dev:
	@find_port() { \
		port="$$1"; \
		while lsof -nP -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; do \
			port=$$((port + 1)); \
		done; \
		printf "%s" "$$port"; \
	}; \
	api_port=$$(find_port "$(API_PORT)"); \
	extension_port=$$(find_port "$(EXTENSION_PORT)"); \
	while [ "$$extension_port" = "$$api_port" ]; do \
		extension_port=$$(find_port "$$((extension_port + 1))"); \
	done; \
	printf "Starting API on http://localhost:%s\n" "$$api_port"; \
	printf "Starting extension dev server on http://127.0.0.1:%s\n" "$$extension_port"; \
	$(MAKE) -j 2 PORTS_SELECTED=1 API_PORT=$$api_port EXTENSION_PORT=$$extension_port dev-api dev-extension

dev-api: $(API_UVICORN)
	@find_port() { \
		port="$$1"; \
		while lsof -nP -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; do \
			port=$$((port + 1)); \
		done; \
		printf "%s" "$$port"; \
	}; \
	if [ "$(PORTS_SELECTED)" = "1" ]; then \
		api_port="$(API_PORT)"; \
	else \
		api_port=$$(find_port "$(API_PORT)"); \
	fi; \
	printf "Starting API on http://localhost:%s\n" "$$api_port"; \
	cd $(API_DIR) && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port $$api_port

dev-extension:
	@find_port() { \
		port="$$1"; \
		while lsof -nP -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; do \
			port=$$((port + 1)); \
		done; \
		printf "%s" "$$port"; \
	}; \
	if [ "$(PORTS_SELECTED)" = "1" ]; then \
		extension_port="$(EXTENSION_PORT)"; \
	else \
		extension_port=$$(find_port "$(EXTENSION_PORT)"); \
	fi; \
	api_base_url="$${VITE_API_BASE_URL:-http://localhost:$(API_PORT)}"; \
	printf "Starting extension dev server on http://127.0.0.1:%s\n" "$$extension_port"; \
	printf "Using API at %s\n" "$$api_base_url"; \
	VITE_API_BASE_URL="$$api_base_url" npm run dev:extension -- --port $$extension_port

build:
	npm run build

test: $(API_UVICORN)
	npm test
	cd $(API_DIR) && .venv/bin/pytest

test-api: $(API_UVICORN)
	cd $(API_DIR) && .venv/bin/pytest

typecheck:
	npm run typecheck

lint-api: $(API_UVICORN)
	cd $(API_DIR) && .venv/bin/ruff check .
