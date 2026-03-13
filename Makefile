.PHONY: *

test:
	docker build -t mediasnacks-test .
	docker run --rm mediasnacks-test

