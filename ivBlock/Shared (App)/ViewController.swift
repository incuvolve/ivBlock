//
//  ViewController.swift
//  Shared (App)
//
//  Created by Michael Hülsen on 07.07.25.
//

import WebKit
import Foundation

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "de.incuvolve.ivBlock.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        
        // Ensure JavaScript is enabled (should be by default but good to verify)
        // self.webView.configuration.preferences.javaScriptEnabled = true  // Removed as per instructions

        // Enable WKWebView inspectability for debugging (iOS 16.4+, macOS 13.3+)
        if #available(iOS 16.4, macOS 13.3, *) {
            self.webView.isInspectable = true
        }

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = false
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("WKWebView did finish navigation. Injecting test JavaScript.")
        webView.evaluateJavaScript("console.log('Test JavaScript injected and executed!'); 1 + 1") { (result, error) in
            if let error = error {
                print("Error evaluating test JavaScript: \(error)")
            } else if let result = result {
                print("Test JavaScript result: \(result)")
            }
        }
        
        let localizedStrings = getLocalizedSplashMessages()
        
        let jsonEncoder = JSONEncoder()
        // jsonEncoder.outputFormatting = .withoutEscapingSlashes // Removed for safer JavaScript injection
        guard let jsonData = try? jsonEncoder.encode(localizedStrings),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            print("Error encoding localized strings to JSON.")
            return
        }

#if os(iOS)
        webView.evaluateJavaScript("show('ios', null, null, \(jsonString))")
#elseif os(macOS)
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), true, \(jsonString))")
                } else {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), false, \(jsonString))")
                }
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
#if os(macOS)
        if (message.body as! String != "open-preferences") {
            return
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                NSApp.terminate(self)
            }
        }
#endif
    }
    
    private func getLocalizedSplashMessages() -> [String: String] {
        let bundle = Bundle(for: type(of: self))
        let jsRequiredMessage = NSLocalizedString("jsRequiredMessage", tableName: nil, bundle: bundle, value: "", comment: "Message shown when JavaScript is disabled.")
        print("jsRequiredMessage: \(jsRequiredMessage)")
        
        let safariExtSettingsIOS = NSLocalizedString("safariExtSettingsIOS", tableName: nil, bundle: bundle, value: "", comment: "Instruction for iOS users to enable the Safari extension.")
        print("safariExtSettingsIOS: \(safariExtSettingsIOS)")
        
        let safariExtPrefsMacUnknown = NSLocalizedString("safariExtPrefsMacUnknown", tableName: nil, bundle: bundle, value: "", comment: "Instruction for macOS users to enable the extension in Safari Extensions preferences (initial state).")
        print("safariExtPrefsMacUnknown: \(safariExtPrefsMacUnknown)")
        
        let safariExtPrefsMacOn = NSLocalizedString("safariExtPrefsMacOn", tableName: nil, bundle: bundle, value: "", comment: "Message for macOS users when the extension is on, referring to Safari Extensions preferences.")
        print("safariExtPrefsMacOn: \(safariExtPrefsMacOn)")
        
        let safariExtPrefsMacOff = NSLocalizedString("safariExtPrefsMacOff", tableName: nil, bundle: bundle, value: "", comment: "Message for macOS users when the extension is off, referring to Safari Extensions preferences.")
        print("safariExtPrefsMacOff: \(safariExtPrefsMacOff)")
        
        let quitAndOpenSafariExtPrefs = NSLocalizedString("quitAndOpenSafariExtPrefs", tableName: nil, bundle: bundle, value: "", comment: "Button text to quit the app and open Safari Extensions preferences.")
        print("quitAndOpenSafariExtPrefs: \(quitAndOpenSafariExtPrefs)")
        
        let safariExtSettingsMacOn = NSLocalizedString("safariExtSettingsMacOn", tableName: nil, bundle: bundle, value: "", comment: "Message for macOS users when the extension is on, referring to Safari Settings Extensions section.")
        print("safariExtSettingsMacOn: \(safariExtSettingsMacOn)")
        
        let safariExtSettingsMacOff = NSLocalizedString("safariExtSettingsMacOff", tableName: nil, bundle: bundle, value: "", comment: "Message for macOS users when the extension is off, referring to Safari Settings Extensions section.")
        print("safariExtSettingsMacOff: \(safariExtSettingsMacOff)")
        
        let safariExtSettingsMacUnknown = NSLocalizedString("safariExtSettingsMacUnknown", tableName: nil, bundle: bundle, value: "", comment: "Instruction for macOS users to enable the extension in Safari Settings Extensions section (initial state).")
        print("safariExtSettingsMacUnknown: \(safariExtSettingsMacUnknown)")
        
        let quitAndOpenSafariSettings = NSLocalizedString("quitAndOpenSafariSettings", tableName: nil, bundle: bundle, value: "", comment: "Button text to quit the app and open Safari Settings.")
        print("quitAndOpenSafariSettings: \(quitAndOpenSafariSettings)")
        
        return [
            "jsRequiredMessage": jsRequiredMessage,
            "safariExtSettingsIOS": safariExtSettingsIOS,
            "safariExtPrefsMacUnknown": safariExtPrefsMacUnknown,
            "safariExtPrefsMacOn": safariExtPrefsMacOn,
            "safariExtPrefsMacOff": safariExtPrefsMacOff,
            "quitAndOpenSafariExtPrefs": quitAndOpenSafariExtPrefs,
            "safariExtSettingsMacOn": safariExtSettingsMacOn,
            "safariExtSettingsMacOff": safariExtSettingsMacOff,
            "safariExtSettingsMacUnknown": safariExtSettingsMacUnknown,
            "quitAndOpenSafariSettings": quitAndOpenSafariSettings,
            "currentLocaleIdentifier": Locale.current.identifier // Add current locale for debugging
        ]
    }

}
