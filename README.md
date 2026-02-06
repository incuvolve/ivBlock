# ivBlock 

ivBlock [ˈaɪviblɒk] is a Safari extension for iOS and MacOS.
This project was started to bring the functionality of the Chrome/Firefox extension "LeechBlock NG" to the Apple ecosystem.

## Repository & Project Design

The repository is consisting of the main shell for the Safari extension as well as a core module that is the actual fork of LeechBlock NG.

### Fork and Contribution Strategy

The project is regarded as active downward fork. As soon as LeechBlock NG gets updated, it should be easily possible to update the forked core of ivBlock (submodule) and merge the changes into the ivBlock codebase. 

### Initial creation of the Xcode project

#### Run the safari-web-extension-converter

```sh
xcrun safari-web-extension-converter --project-location xcode --app-name ivBlock --bundle-identifier de.incuvolve.ivBlock LeechBlockNG

xcrun safari-web-extension-converter --app-name ivBlock --bundle-identifier de.incuvolve.ivBlock LeechBlockNG
```
#### Warnings during the conversion

```log
Warning: The following keys in your manifest.json are not supported by your current version of Safari. If these are critical to your extension, you should review your code to see if you need to make changes to support Safari:
	history
	open_in_tab
Warning: Persistent background pages are not supported on iOS and iPadOS. You will need to make changes to support a non-persistent background page.
```

