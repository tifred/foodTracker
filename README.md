### TO RUN AND TEST APPLICATION:

1. Load dist/index.html in a browser

  * Four Headers should appear:
  * "Select Foods"
  * "Foods Eaten Today"
  * "Recently Selected Foods"
  * "Saved Days"
  * Input search bar should appear below "Select Foods".
  * Input search bar should have focus.
  * Note: behavior may be different if page has been used before.
  * Usage can save items to localStorage which are then loaded onto page.
  * See "Persistence" below for expected behavior for saved data.
  * Run "localStorage.clear()" in console to simulate a first page load.

2. Enter food into search bar and hit return.

  * Message of "Loading Results" should appear below search bar.
  * Three results should appear in a list below search bar.
  * "Loading Results" message should disappear.
  * "Show More" button should appear.

3. Click on "Show More" button.

  * Three more results for the food should appear with each click.

4. Hover over food in results list.

  * Background color should change to green.

5. Click on food in results list.

  * All foods should disappear from results list.
  * "Show More" button should disappear.
  * Selected food should appear in "Recently Selected Foods" list.
  * Selected food should appear in "Foods Eaten Today" list.
  * Food should list name and calorie in the table.
  * Table should have a "total" line with total of all calories.
  * "Save This Day" button should appear below food table.
  * "Clear All Foods" button should appear below food table.

6. Click on food in "Recently Selected Foods" list.

  * Selected food should appear in "Foods Eaten Today" table.
  * The total calories in food table should be updated to show new total.

7. Hover over food in food table.

  * Background color should change to white.
  * Number of calories should change to the text "Remove?"

8. Click on "Remove?" text.

  * Food should be removed from food table.
  * Total in food table should be updated.
  * If table now has no foods, the two buttons should disappear.
  * If table now has no foods, "total" line in table should disappear.

9. Click on "Clear All Foods" button.

  * All foods should be removed from food table.
  * The "Save This Day" and "Clear All Foods" buttons should disappear.
  * The "total" line in table should disappear.
  * Note: this prevents persistence upon page loads, which is a good thing.

10. Click on "Save This Day" button.

  * Table should appear below "Saved Days" header.
  * Table should be labeled "Day 1", "Day 2", etc.
  * Table should contain list of foods, calories, and total calories.
  * Tables should resize as viewport changes: from four across to one across.

12. Data Persistence.

  * Recently Selected Foods should persist upon page reload.
  * Foods table should persist upon page reload.
  * Clicking on "Remove?" or "Clear All Foods" should prevent persistence.
  * Saved Days should not persist upon reload (undesireable, but expected for now).

11. Error Handling.

  * If server cannot be reached, should display "Failed To Reach API Server".
  * Test by inserting "XYXY" into url: https://api.nutritionix.com/
  * (found at line 154 in views/app.js).
  * If server cannot find a match, should display "No Matching Foods Were Found".
  * Test by typing in "foobar" in search bar and hitting return.

12. Build Environment.

  * Unzip nodes.modules.zip
  * Run "gulp build"
  * This will minimize relevant files in src/ and put the results in dist/

14. Known Problems.

  * The Saved Days do not persist upon page reload.
  * That is because the implementation of Saved Days is poor and needs to be redone.
  * If "Save This Day" is used once, then "Clear All Foods", then foods
  * are added, and then "Save This Day" is used again, all but the last
  * saved day will have no table data rows.
  * Upon clicking "Save This Day", the actions done by "Clear All Foods"
  * should happen automatically.  Ran into problems implementing that.
