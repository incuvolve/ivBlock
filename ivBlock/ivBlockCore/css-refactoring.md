Optimization of HTML/CSS files.
The application uses HTML/CSS for the markup.

Problem, if the html is rendered on an iPhone i want to make sure that 
there is only vertical scrolling, but no horizontal scrolling.

Tasks:
* Have a look at the html and css files.
* Generate ideas for optimizing the markup.
* Implement the ideas

Result:
*   **Corrected Viewport Meta Tag:** I updated the `viewport` meta tag in all relevant HTML files to use `initial-scale=1.0`. This ensures that the pages are rendered at the correct scale on mobile devices, preventing the "zoomed-out" effect that can lead to horizontal scrolling.

*   **Responsive Images:** I modified the CSS to make the logo image responsive. Instead of a fixed pixel width, it now has a `max-width` of `100%`, allowing it to scale down gracefully on smaller screens.

*   **Improved CSS Box Model:** I added `box-sizing: border-box;` to all elements. This makes working with layouts and padding more intuitive and less likely to cause unexpected overflow.

*   **Prevented Horizontal Scrolling:** I added `overflow-x: hidden;` to the `body` element in the main stylesheets to explicitly prevent horizontal scrolling.

*   **Stacked Password Input:** On smaller screens, the password input field and submit button now stack vertically to prevent horizontal scrolling on the password entry page.

These changes should resolve the horizontal scrolling issue on mobile devices and improve the overall responsiveness of the application's pages.