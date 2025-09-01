# Config
PYTHON=python3
VENV?=.venv
ACTIVATE=. $(VENV)/bin/activate;

.PHONY: help venv install run clean

help:
	@echo "make venv     - create virtualenv"
	@echo "make install  - install deps into venv"
	@echo "make run PDF=path/to/file.pdf - run extraction on a PDF"
	@echo "make clean    - remove venv and caches"

venv:
	$(PYTHON) -m venv $(VENV)

install: venv
	$(ACTIVATE) && pip install --upgrade pip && pip install -r requirements.txt

run:
ifndef PDF
	$(error PDF is not set, use: make run PDF=path/to/file.pdf)
endif
	$(ACTIVATE) && OPENAI_API_KEY=$$OPENAI_API_KEY python agent_customer_info.py $(PDF)

clean:
	rm -rf $(VENV) __pycache__ .pytest_cache *.pyc