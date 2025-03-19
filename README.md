# FusionAuth Quickstart End-to-End Test GitHub Action

This GitHub Action is designed to run standardized Playwright end-to-end tests for FusionAuth Quickstart applications.

## Dependencies

Before running this action, you need to have the following dependencies up and running:
- Fully configured FusionAuth instance, based on the requirements of the Quickstart application.
- Running Quickstart application, based on the requirements of the Playwright tests.

## Inputs

The following optional inputs can be used to customize the action:
- `FUSIONAUTH_URL`: The FusionAuth URL (default: `http://localhost:9011`).
- `QUICKSTART_URL`: The URL of the Quickstart application (default: `http://localhost:3000`).
- `ARTIFACT_PREFIX`: The prefix for the generated Playwright artifact, useful for matrix workflows (default: `playwright`).

## Steps

The action performs the following steps:
1. **Action Path**: Outputs the action path.
2. **Action Repository**: Outputs the action repository.
3. **Action Ref**: Outputs the action ref.
4. **Check FusionAuth status**: Checks for the OK status of FusionAuth up to 5 times with increasing wait times.
5. **Check Quickstart status**: Checks for the OK status of the Quickstart application up to 5 times with increasing wait times.
6. **Setup Node.js**: Sets up Node.js using the LTS version required by Playwright.
7. **Install dependencies**: Installs npm dependencies required by Playwright.
8. **Install Playwright Browsers**: Installs Playwright browsers with dependencies required by Playwright.
9. **Run Playwright tests**: Runs Playwright tests from the specified [tests](tests) directory.
10. **Upload Playwright results**: Uploads Playwright test results as an artifact to the workflow run.

## Outputs

- Playwright test results are uploaded as an artifact with a specified prefix.

## Secrets

This Action uses no secrets. The action uses the temporary FusionAuth instance and uses the standard example usernames and passwords.

For your tests, you can use users `admin@example.com` and `richard@example.com`, with password `password` if you use the default kickstart. If you use a custom kickstart, then use the users defined in that.

## Example of use

Make a `.github/workflows/playwright.yml` file in your repository and add steps similar to the code in the Quickstart example https://github.com/sonderformat-llc/quickstart-nextjs-e2e-test-prototype.

```yaml
name: Playwright Tests on all Ubuntu Github Runners
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '10 6 * * 1'
  workflow_dispatch:
jobs:
  e2e-test:
    name: End 2 End Test
    timeout-minutes: 60
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ "ubuntu-24.04", "ubuntu-22.04", "ubuntu-20.04" ]
    permissions:
      contents: read # for actions/checkout to fetch code
      security-events: write # for github/codeql-action/upload-sarif to upload SARIF results
      actions: read
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4.2.2

      - name: Setup Node
        uses: actions/setup-node@v4.3.0
        with:
          node-version: lts/*

      - name: Start FusionAuth
        uses: fusionauth/fusionauth-github-action@v1.0.4
        with:
          FUSIONAUTH_APP_KICKSTART_DIRECTORY_PATH: kickstart

      - name: Install Application
        run: npm i --prefix "./complete-application/"

      - name: Build Application
        run: npm run build --prefix "./complete-application/"

      - name: Run Application
        run: npm start --prefix "./complete-application/" &

      - name: Run Playwright Quickstart E2E Test
        uses: sonderformat-llc/run-quickstart-e2e-test@v0.2.2
        with:
          FUSIONAUTH_URL: 'http://localhost:9011'
          QUICKSTART_URL: 'http://localhost:3000'
          ARTIFACT_PREFIX: 'playwright-${{ matrix.os }}'
```

