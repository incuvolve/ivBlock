# ivBlock Release Workflows

Description of the ivBlock release workflow.

## Starting development of new version

* merge recent changes on main back to testing and development branches
* increment version number 
    * manifest.json in ivBlockCore
    * in every subproject in Xcode in the target sections
        * iOS App
        * iOS Extension
        * Mac App
        * Mac Extension
* semantic versioning
    * 1.0.0 -> 2.0.0 for major changes
    * 1.0.0 -> 1.1.0 for minor changes
    * 1.0.0 -> 1.0.1 for patches

## development phase

* ivBlockCore (submodule) = forked LeechBlockNG repository
    * in case there are upstream changes, sync the master branch in
      GitHub
    * pull changes on master branch
    * merge changes from master into integration locally
    * either create new development branch from integration, or if it
      has been created before, merge changes from integration to the dev
      branch. Naming convention: dev-1.0.2
    * push new dev branch to github
* ivBlock
    * update development branch with commits from main and testing
    * work on development branch
    * as soon as modifications in ivBlockCore are made, push changes to ivBlock repository as well (references to submodule to most recent commit)

## first testing phase

prepare releases for TestFlight:

* ivBlock project
    * create a pull request from development to testing in GitHub, rebase and merge
    * submodule from development branch should point to the correct submodule commit (dev-1.0.2 for example)
* Xcode Cloud workflows
    * testing workflows build latest code from main branch and
      distribute the update on Testflight for iOS and MacOS


## prepare releeases for distribution in App Store Connect

* Core Module
    * merge development branch of submodule into integration branch
    * push integration branch to github

* main repository
    * create a pull request from testing to main in GitHub, create merge commit
    * now main branch points to the correct commit from the submodule
* Xcode Cloud Workflows
    * manually trigger the Release Candidate workflows for iOS / MacOS
* AppStore Connect
    * create new versions with correct version number for iOS and MacOS
      version
    * add description for changes in German and English
    * add screenshots
    * add promotional text
    * assign release build to app version for distribution
* Submit app for review


## Postprocessing

* Update website

* pull main to local repo
* tag the release, e.g.
    * git tag v⒈.0.2
* push the tag
    * git push origin tag v1.0.2
* GitHub
    * create release in GitHub pointing to release tag
    * create pull request to testing to update the origin testing branch
* checkout testing and merge main
* checkout development and merge testing



