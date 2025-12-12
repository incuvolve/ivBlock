# ivBlock Release Workflows

Description of the ivBlock release workflow.

## Starting development of new version

* merge recent changes on main to development branch
* increment version number manifest.json
    * 1.0.0 -> 2.0.0 for major changes
    * 1.0.0 -> 1.1.0 for minor changes
    * 1.0.0 -> 1.0.1 for patches

## prepare releases for testing in TestFlight

* developments in ivBlockCore submodule are commited and pushed to integration branch of ivBlockCore / LeechblockNG repository
* developments in main ivBlock project including reference to ivBlockCore submodule are commited and  pushed to development branch of the main repository
* create a pull request from dev to main in GitHub, rebase and merge
* Xcode Cloud workflows
    * testing workflows build latest code from main branch and
      distribute the update on Testflight for iOS and MacOS

## prepare releeases for distribution in App Store Connect

* Xcode Cloud Workflows
    * manually trigger the Release Candidate workflows for iOS / MacOS

* assign release build to app version for distribution
* create tag for commit of release build in GitHub
* create release in GitHub

## update local main and development branch

* main branch checkout, pull changes and update submodules


