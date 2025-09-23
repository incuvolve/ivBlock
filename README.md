# ivBlock

Safari Port of LeechBlock NG

## Conversion

```sh
xcrun safari-web-extension-converter --project-location xcode --app-name ivBlock --bundle-identifier de.incuvolve.ivBlock LeechBlockNG

xcrun safari-web-extension-converter --app-name ivBlock --bundle-identifier de.incuvolve.ivBlock LeechBlockNG
```

##  Warnings during conversion

```log
Warning: The following keys in your manifest.json are not supported by your current version of Safari. If these are critical to your extension, you should review your code to see if you need to make changes to support Safari:
	history
	open_in_tab
Warning: Persistent background pages are not supported on iOS and iPadOS. You will need to make changes to support a non-persistent background page.
```

## Release Workflow

* developments in LeechBlock submodule are being pushed to integration branch
* developments and reference to LeechBlock submodule are pushed to development branch
* create pull request from dev to main in GitHub
* automated deployment to testflight
* main branch checkout, pull changes and update submodules
