# ivBlock Release Workflows

Description of the ivBlock release workflow.

## Starting development of new version

* merge recent changes on main back to testing and development branches
* increment version number 
    * manifest.json in ivBlockCore
    * in every subproject in Xcode
* semantic versioning
    * 1.0.0 -> 2.0.0 for major changes
    * 1.0.0 -> 1.1.0 for minor changes
    * 1.0.0 -> 1.0.1 for patches

## development phase

* ivBlockCore (submodule)
    * create new development branch from integration branch, e.g.
      dev-1.0.2
    * push new dev branch to github
* ivBlock
    * update development branch with commits from main and testing
    * work on development branch
    * as soon as modifications in ivBlockCore are made, push changes to ivBlock repository as well (references to submodule to most recent commit)

## testing phase

prepare releases for TestFlight:

* create a pull request from development to testing in GitHub, rebase and merge
* Xcode Cloud workflows
    * testing workflows build latest code from main branch and
      distribute the update on Testflight for iOS and MacOS

## prepare releeases for distribution in App Store Connect

* create a pull request from testing to main in GitHub, create merge
  commit
* Xcode Cloud Workflows
    * manually trigger the Release Candidate workflows for iOS / MacOS
* AppStore Connect
    * create new versions with correct version number for iOS and MacOS
      version
    * assign release build to app version for distribution
* Submit app for review

## Postprocessing

* GitHub
    * create tag for commit of release build in GitHub
    * create release in GitHub

## update local main and development branch

* main branch checkout, pull changes and update submodules


