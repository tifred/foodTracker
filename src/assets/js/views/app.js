// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  /*
      Watch for user initiated events in the DOM.
      Call these methods, which will alter the model.
  */

  events: {
    'keypress #searchbar': 'createSearchResults',
    'click #showMoreResults': 'createMoreSearchResults',
    'click #saveDay': 'createSavedDay',
    'click #clearFoods': 'foodsDestroy'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.$searchresultslist = $('#searchresultslist');
    this.$recentresultslist = $('#recentresultslist');
    this.$foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.loadingResults = $('#loadingResults');
    this.$saveDay = $('#saveDay');
    this.$savedDayRow = $('.saved-days-row');
    this.savedDaysCount = 0;
    this.$clearFoods = $('#clearFoods');

    // Variables used to make the "Show More" searches button work.
    this.rangeStart = 0;
    this.rangeEnd = 3;
    this.lastSearchInput = '';
    this.searchInput = '';
    this.useLastSearchInput = false;

    /*
        Listen for changes in collections of models.
        Call these methods, which will alter the view.
        The word "add", as in "addSearchResults", means to add to the DOM.
    */

    // When there are new searchresults, add them all to the DOM.
    this.listenTo(app.searchresults, 'add', this.addSearchResults);

    // When adding one food only, make one simple addition to collection.
    this.listenTo(app.foods, 'add', this.addFood);

    // When adding a food, clear search results in collection and DOM.
    this.listenTo(app.foods, 'add', this.clearSearchResults);

    // When there are new recent results, add them to the DOM.
    this.listenTo(app.recentresults, 'add', this.addRecent);

    // When a food is removed, remove all and add remaining foods to DOM again.
    this.listenTo(app.foods, 'remove', this.RemoveAndAddAllFoods);

    // When there is an update (e.g. a remove or an add), run render.
    this.listenTo(app.foods, 'update', this.render);

    // When a day is saved, update the DOM with addSavedDays.
    this.listenTo(app.foods, 'saveTheDay', this.addSavedDays);

    // Hide these elements at first.
    this.showMoreResults.hide();
    this.loadingResults.hide();
    this.$saveDay.hide();
    this.$clearFoods.hide();

    /*
       Retrieve from localstorage upon load.
       Recent results are always preserved.
       Foods are preseved until the "Clear All Foods" button is clicked.
       Saved days are never preserved (which is bad!)
    */
    app.recentresults.fetch();
    app.foods.fetch();
  },

  render: function() {
    /*
        If there are any foods to show in table,
        display the calories total in the table
        and show the "Save This Day" button.
    */

    if (app.foods.length > 0) {
      this.$saveDay.show();
      this.$clearFoods.show();
      this.addTotalCals();
    } else {
      this.$saveDay.hide();
      this.$clearFoods.hide();
      self.$("#foodtable #table-total-row").remove();
    }

  },

  /***** Let the Methods Begin *****/

  addTotalCals: function() {
    var calCount = 0;
    app.foods.each(function(food) {
      calCount += food.get('calories');
    });
    self.$("#foodtable #table-total-row").remove();
    self.$foodtable.append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');
  },

  createSearchResults: function( event ) {

    /*
        An initial search will get three items from the API's url.
        Hitting the "Show More" button will get the next three items.
        The boolean "useLastSearchInput" signifies whether this is an initial
        search or a "Show More" search.
    */

    if (self.useLastSearchInput) {
      // If the "Show More" button was used, use last input value.
      searchInput = self.lastSearchInput;
      // Otherwise, do all this:
    } else {
      // If the enter key was not hit or there is no value, do nothing.
      if ( event.which !== ENTER_KEY || !this.$searchbar.val().trim() ) {
        return;
      }
      // Otherwise, do something with the current input:
      this.loadingResults.show(); // Show "loading" while results come back.
      searchInput = this.$searchbar.val().trim();
      self.lastSearchInput = searchInput; // Save input for more searches.
      self.rangeStart = 0;
      self.rangeEnd = 3;
      app.searchresults.reset(); // Clear out old searchresults.
    }

    // Set range: e.g. 0:3 , 3:6 , etc.
    var range = '' + self.rangeStart + ':' + self.rangeEnd + '';

    /*
        Run API from nutritionix.
        This happens for both an initial search and a "Show More".
        Results will be in "data.hits[i]."
        Create new models in the searchresults collection.

        If server cannot be reached, display "Failed To Reach API Server".
        If server cannot find a match, display "No Matching Foods Were Found".
        Failure messages go into the searchresults collection.
    */

    var nutQuery = 'https://api.nutritionix.com/v1_1/search/' + searchInput + '?results=' + range + '&fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=c6f2c498&appKey=63a855793383d6e263e27c9993661a29';

    $.getJSON(nutQuery)
      .done(function(data) {
        // data.hits array will be empty if no matches are found.
        if ( data.hits.length === 0) {
          app.searchresults.create( {
            name: "No Matching Foods Were Found",
            calories: 0
          });
        }
        for (var i = 0; i < data.hits.length; i++) {
          app.searchresults.create( {
            name: data.hits[i].fields.item_name,
            calories: Math.floor(data.hits[i].fields.nf_calories)
          });
        }
      })
      .fail(function() {
        app.searchresults.create( {
          name: "Could Not Reach Server With Food Information",
          calories: 0
        });
      });

    /*
        Clear out two variables.
        Clearing these out handles the case where another search
        is run BEFORE selecting a food from the list.
        When a food is selected, the more extensive "clearSearchResults" runs.
    */

    this.$searchbar.val('');
    self.useLastSearchInput = false;
  },

  /*
      addSearchResults: Add the search results to the DOM.
      Makes "Show More Matches" button visible.
  */

  addSearchResults: function() {
    // Remove all the li elements that held old search results.
    self.$("#searchresultslist li").remove();

    // Loop through searchresults collection and add li's to the ul.
    app.searchresults.each(function(result) {
      var searchresultView = new app.SearchResultView({model: result});
      self.$searchresultslist.append(searchresultView.render().el);
    });

    self.showMoreResults.show();

    // Hide the "loading message", which started in createSearchResults.
    self.loadingResults.hide();
  },

  /*
      createMoreSearchResults: run when "Show More" button is clicked.
      Increase the range, set the useLastSearchInput variable to true.
      Then run createSearchResults method (should I use a custom trigger instead?)
  */

  createMoreSearchResults: function() {
    self.rangeStart += 3;
    self.rangeEnd += 3;
    self.useLastSearchInput = true;
    this.createSearchResults();
  },

  /*
      clearSearchResults: clears results from DOM and collection.
      Also resets some key variables.
      This is run when an item is selected from searchresults.
  */

  clearSearchResults: function() {
    app.searchresults.reset();
    self.$("#searchresultslist li").remove();
    self.lastSearchInput = '';
    self.rangeStart = 0;
    self.rangeEnd = 3;
    this.useLastSearchInput = false;
    self.showMoreResults.hide();
  },

  /*
      addRecent: Adds recent results to DOM.
      The models in this collection are created when a user
      clicks on a search result
      It happens in the "createFoodandRecentResults" method
      in the SearchResultView constructor/view.
  */

  addRecent: function(result) {
      var recentView = new app.RecentResultView({model: result});
      self.$recentresultslist.append(recentView.render().el);
  },

  /*
      addFood: Adds one new food to the table in the DOM.
      The models in this collection are created when a user
      clicks on a search result.
      It happens in the "createFoodandRecentResults" method
      in the SearchResultView constructor/view.
  */

  addFood: function(food) {
      var foodView = new app.FoodView({model: food});
      self.$foodtable.append(foodView.render().el);
  },

  /*
      RemoveAndAddAllFoods: Removes all foods from DOM.
      Builds table in DOM again from scratch.
      Used when a single food is removed by the user.
  */

  RemoveAndAddAllFoods: function() {
    self.$("#foodtable .table-data-food").remove();
    app.foods.each(this.addFood, this);
  },

  /*
      NOTE: THE FOLLOWING IS A HACK.

      There has to be a better way to save days, using collections.
      I think I need a collection inside a collection, but don't know how.
      Ideas?
  */

  /*
      createSavedDay: Push clone of current "food" collection onto an array.
      Then trigger "saveTheDay", which will call addSavedDays.
  */

  createSavedDay: function() {
    app.allSavedDays = app.allSavedDays || [];
    app.allSavedDays.push(app.foods.clone());
    app.foods.trigger('saveTheDay');
  },

  /*
      addSavedDays: Add a table for each Saved Day.
      This is ugly!
      What is the right way to do this?
  */

  addSavedDays: function() {
    self.$savedDayRow.find('div').remove();

    for (var i = 0; i < app.allSavedDays.length; i++) {
      var dayNum = i + 1;
      var calCount = 0;
      self.$savedDayRow.append('<div class="col-xs-12 col-sm-6 col-md-3"><div>Day ' + dayNum + '</div><table class="table table-striped table-bordered table-condensed table-hover table-day' + dayNum + '"><tbody><tr><th>Food</th><th>Calories</th></tr>');
      app.allSavedDays[i].each(function(food) {
        calCount += food.get('calories');
        var foodSavedDayView = new app.FoodSavedDayView({model: food});
        $('.table-day' + dayNum + ' tbody').append(foodSavedDayView.render().el);
      });

      $('.table-day' + dayNum + ' tbody').append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');

      self.$savedDayRow.append('</tbody></table></div>');
    }
  },

  /*
      foodsDestroy: run by click on "Clear All Foods" button.
      Effectively removes foods from collection and from localStorage.
      Triggers a "remove" event, which will run RemoveAndAddAllFoods.
  */

  foodsDestroy: function() {
     while (app.foods.models.length > 0) {
       app.foods.at(0).destroy();
     }
  }
});
