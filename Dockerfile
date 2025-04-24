# 1. Base Python image
FROM python:3.10-slim

# 2. Prevent Python bytecode and buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Install system deps (including git for fetching optional submodules)
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential git \
    && rm -rf /var/lib/apt/lists/*

# 4. Set work directory
WORKDIR /app

# 5. Copy project metadata from pyproject.toml and README
COPY pyproject.toml poetry.lock* README.md ./

# 5a. (Optional) Use pip fast-deps to speed up dependency resolution
# Place the following immediately after copying metadata and before copying source code
ENV PIP_USE_FEATURE=fast-deps

# 5b. Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir . --use-feature=fast-deps

# 6. Copy the rest of the source code. Copy the rest of the source code

# 7. Expose the Langflow port
EXPOSE 7860

# 8. Run the ASGI server pointing to the factory function
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "7860", "--factory", "langflow.main:create_app"]