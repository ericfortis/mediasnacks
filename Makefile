.PHONY: *

test:
	@docker run --rm $$(docker build -q .)

