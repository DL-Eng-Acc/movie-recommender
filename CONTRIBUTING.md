# Contributing to `movie-recommender`

To start, thank you for considering contributing to this project. Having contributors such as yourself allow us to develop our website further, and to a high quality, which is very appreciated.

## Getting Started
To begin, please look through our [Code of Conduct](CODE_OF_CONDUCT.md) if you haven't already, to understand the behaviour we are looking to cultivate in our community.

Furthermore, also refer to the [README.md](README.md) for the initial setup instructions for running the project - this is also required to work on the project.

## Contribution Model
Like most open-source projects, we utilise a fork-and-pull model. Contributors fork from the main repository, make a branch encapsulating their changes, and once ready can submit a pull request from their forked branch to the `main` branch of the main repository.

## Code Editor
We recommend using an IDE such as [VSCode](https://code.visualstudio.com/) to work on the project for linting and syntax validation.

Regarding IDE extensions, we heavily recommend using [SonarLint](https://www.sonarsource.com/products/sonarqube/ide/) to ensure code is of a high quality and free of any potential security vulnerabilities.

## Architecture Overview
The project is split into two folders, the `client/` and `server/`. Both run on different ports on the dev server, and uses CORS to interact between them.

The `client/` relates to the frontend, utilising React Components and CSS. There is an api folder for an api fetch call onto the backend.

The `server/` relates to the backend, utilising ExpressJS. Because this project utilises TMDB, this mostly pertains to sending get requests and processing the response data. Currently MongoDB is not utilised in the project.

## Submitting Issues
If you found a bug to fix, some documentation to clarify, or want to implement/request a new feature, we use issues to document these. When you [submit an issue](https://github.com/fn5-310/movie-recommender/issues/new), select the issue template most relevant to your request - or use the blank issue if none apply.

For the most part (except for key tasks), any issues will go through an approval process by the project team - whether the bug is dismissable, a feature out of scope, etc. The project team may require extra information in some cases. If approved, the issue is open to be assigned, and can be further developed/fixed.

### Key Tasks
Issues denoted as key tasks are those that were outlined in the Project Proposal in the initial ideation phase of the project. These tasks are automatically approved to be worked on.

## Creating a Pull Request
Before making a pull request, ensure that:
- The feature you are submitting is from a feature-branch, i.e. not the main branch of your forked repository
- Your branch name is relevant to the added content
- Your branch is up to date with to the latest version of the main repo
- The project can run without errors or crashes
- All test cases (new and existing) pass - see below on **Creating Tests**.
- The frontend type-checks and lints without errors - see below on **Frontend Type Checking and Linting**.

When submitting a pull request, there will be a preset template to fill out, including a checklist of all of the prerequisites before submitting the pull request. The other important section is linking your PR to the issue your PR closes, using closing keywords.

After submitting, a team member will review your work, possibly request changes, and approve your PR. Your PR should then be (if you are merging) squash merged into the `main` branch.

Congratulations! You have successfully contributed to the `movie-recommender` project!

## Frontend Type Checking and Linting
The client uses strict TypeScript (`strict`, `noUncheckedIndexedAccess` and `noImplicitReturns` in `client/tsconfig.app.json`) and is linted with [oxlint](https://oxc.rs/docs/guide/usage/linter.html). The lint includes type-aware rules that reject `any` values and unhandled promises. CI runs both on every pull request, and you can run them from `client/`:
```
npm run typecheck
npm run lint
```

These conventions keep both passing:
- Request TMDB data through the functions in `client/src/api/`, which use `tmdbGet` and the response types in `client/src/types/tmdb.ts`, instead of calling `fetch` in a component.
- Treat values read from storage, `JSON.parse` or form inputs as `unknown` and check them before use (see `client/src/utils/searchStorage.ts`), instead of casting with `as`.
- Indexing an array gives `T | undefined`, so handle the `undefined` case (or use `?.`) instead of adding `!`.
- If you don't want to wait for a promise, such as `navigate()` in a click handler, mark it with `void`.

## Creating Tests
`vitest` is used for all test cases, and roughly follows the below structure:

```js
describe("TestSuiteName", () => {
    it("TestCaseName", async () => { // may not be async depending on test type
        const result = testFunction(arg1, arg2);
        expect(result).toBe(`${arg1}-${arg2}`) // toBe checks identity of result and string - use toEqual for equality
    })
    it("TestCaseName2", async () => {
        const result = testFunction(arg1);
        expect(result).toBe(`${arg1}-${arg1}`)
    })
})
```
Given the above structure, each `it()` call makes one test case, while describe groups these tests together - i.e. a test suite.

The test file for a function should be in the same folder as the file being tested, adding `.spec` or `.test` before the file extension, e.g. `client/testFunction.ts` will have a test file `client/testFunction.spec.ts`.

To run the tests:
```
npm run test
```

### Frontend
Frontend tests make use of the [React Testing Library](https://github.com/testing-library/react-testing-library), and work by emulating a DOM and rendering the components used.

Unit testing should be done per component or function file in isolation. These test whether the component or function by itself has all required functionality.

Integration testing should be done in a more practical environment, e.g. testing the `SearchBar` from the `App` component. These tests should ensure expected behaviour without colliding with other components.

In the case where a component needs to interact with the backend, this is currently mocked by MSW. in `client/src/test/handlers.ts`, there is a list of handlers; when a handler link is called, a mocked `HttpResponse` will be returned, allowing for mocking external api/backend calls.

Some code waits before acting, such as the debounce on the search input. Don't wait for these delays in real time (with `setTimeout` or a longer `findBy*` timeout), because the test can fail on a slow or busy machine. Instead, call `vi.useFakeTimers({ shouldAdvanceTime: true })` and advance the clock by the delays in `client/src/constants/debounce.ts`, wrapping each advance in `act()`. `client/src/App.spec.tsx` shows the pattern.

While frontend testing can confirm the logic of the DOM state e.g. what classes a component has, what text is displayed, it is unable to test direct visual state, e.g. responsiveness, component alignment, etc. This is more suitable to tools such as Playwright, which currently is not implemented, with no immediate plans of doing so.

### Backend
Backend testing is typically either unit tests on controller files, or integration tests on route files.

Unit tests ensure a backend function works as expected, similar to the frontend. These functions are called directly, and not via the backend route (i.e. use `testFunction()` instead of `fetch("api/testFunction")`).

Integration tests involve starting an instance of the express backend, and testing the routes (such as "api/testFunction"). External dependencies such as DBs may need to have mocked responses to function correctly. The `supertest` package allows sending HTTP responses via `request(app).get("/api/example")`, as an example, returning the response object which can be validated.
