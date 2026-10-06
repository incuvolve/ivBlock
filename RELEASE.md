# ivBlock Release Workflows

Description of the ivBlock development and release workflow.

## Branches

| Branch                  | Purpose                                                       | Protected | Merge method into it                          |
| ----------------------- | ------------------------------------------------------------- | --------- | --------------------------------------------- |
| `main`                  | Released code. Release builds are created manually from here. | Yes       | Merge commit (from `testing`)                 |
| `testing`               | QA / user acceptance. Automatically built and deployed.       | Yes       | Squash (from `development`)                   |
| `development`           | Integration branch for ongoing work.                          | No        | Squash (from feature branches) or direct push |
| `feature/*`, `hotfix/*` | Short-lived working branches.                                 | No        | n/a                                           |

## Keeping local branches in sync

`main` and `testing` are mirrors of the remote. Never commit or merge locally on them; only fast-forward:

```bash
git fetch origin
git checkout main    && git merge --ff-only origin/main
git checkout testing && git merge --ff-only origin/testing
```

Squash merges give `testing` new commits with different SHAs than your `development` commits, so `development` must be realigned after each squash PR.

## Starting development of new version

### Versioning

- use semantic versioning
  - 1.0.0 -> 2.0.0 for major changes
  - 1.0.0 -> 1.1.0 for minor changes
  - 1.0.0 -> 1.0.1 for patches

### Development Workflow

- start from updated development branch
- increment version number
  - manifest.json in ivBlockCore
  - in every subproject in Xcode in the target sections
    - iOS App
    - iOS Extension
    - Mac App
    - Mac Extension

#### ivBlockCore submodule = forked LeechBlock NG repository

- in case there are upstream changes, sync the master branch in
  GitHub
- pull changes on master branch of the submodule
- merge changes from master into integration locally

```
git checkout master && git pull origin master
git checkout integration
git merge master
```

- either create new development branch from integration, or if it
  has been created before, merge changes from integration to the dev
  branch. Naming convention: dev-1.0.2 (in the core module)
- update npm, run tests

```
git checkout -b dev-1.3.x
npm update
npm run test
```

- push new dev branch to github

```
git push origin dev-1.3.x
```

#### ivBlock main project

**If `development` has no new work:**

```bash
git checkout development
git log origin/testing..development     # only your old pre-squash commits expected
git diff origin/testing development     # must be empty, otherwise stop: work would be lost
git reset --hard origin/testing
git push --force-with-lease origin development
```

**If `development` already has new commits on top of the squashed ones:**

```bash
git rebase --onto origin/testing <old-development-tip-before-new-work> development
git push --force-with-lease origin development
```

Use `--force-with-lease` only on `development`, never on `main` or `testing`. If anyone else works on `development`, tell them to reset as well.

Recommended git settings:

```bash
git config --global pull.ff only
git config --global fetch.prune true
```

- update development branch with commits from main and testing
- work on development branch
- as soon as modifications in ivBlockCore are made, push changes to ivBlock repository as well (references to submodule to most recent commit)
- Quality
  - conduct code review
  - check if all new features are properly localized
- Publish changes
  - push development branch to remote

## first testing phase

prepare releases for TestFlight:

- ivBlock project
  - main and testing branch from main project are protected.
  - create a pull request from development to testing in GitHub
    - squash or rebase
  - submodule from development branch should point to the correct submodule commit (dev-1.0.2 for example)
- Xcode Cloud workflows
  - testing workflows build latest code from main branch automatically and
    distribute the update on Testflight for iOS and MacOS

## prepare releases for distribution in App Store Connect

- Core Module
  - merge development branch of submodule into integration branch
  - update Version-ivBlock.md in integration branch
  - push integration branch to github
  - conduct a final test
- main repository
  - optional
    - add latest commit from submodule to development branch and push
    - create a pull request from development to testing (squash or rebase)
  - create a pull request from testing to main in GitHub, create merge commit
  - now main branch points to the correct commit from the submodule
- Xcode Cloud Workflows
  - manually trigger the Release Candidate workflows for iOS / MacOS
- AppStore Connect
  - create new versions with correct version number for iOS and MacOS
    version
  - add description for changes in German and English
  - add screenshots
  - add promotional text
  - assign release build to app version for distribution
- Submit app for review

## Postprocessing

- Update website

- pull main branch from origin to local repo
- tag the release, e.g.
  - git tag v⒈0.2
- push the tag
  - git push origin tag v1.0.2
- GitHub
  - create release in GitHub pointing to release tag
  - name in Github: Version 1.0.1 (if git tag is v1.0.1)
- checkout development and merge from main
