// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  // Watch for user initiated events in the DOM.
  // Call these methods, which will alter the model.
  events: {
    'keypress #searchbar': 'createSearchResults',
    'click #showMoreResults': 'createMoreSearchResults',
    'click #saveDay': 'addSavedDay'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.searchresultslist = $('#searchresultslist');
    this.foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.lastSearchInput = '';
    this.rangeStart = 0;
    this.rangeEnd = 3;
    this.saveDay = $('#saveDay');
    this.savedDayRow = $('.saved-days-row');
    this.savedDaysCount = 0;
    this.useLastSearchInput = false;


    // Listen for changes in the model.
    // Call these methods, which will  alter the view accordingly:
    this.listenTo(app.foods, 'add', this.render);
    this.listenTo(app.foods, 'remove', this.render);
    this.listenTo(app.foods, 'reset', this.render);
    this.listenTo(app.searchresults, 'add', this.addSearchResults);

    this.showMoreResults.hide();
    this.saveDay.hide();
  },

  render: function() {

    console.log("rendered");
    self.$("#foodtable .table-data-food").remove();
    self.$("#foodtable #table-total-row").remove();
    app.searchresults.reset();
    self.$("#searchresultslist li").remove();
    this.showMoreResults.hide();
    console.log(app.foods.length);
    if (app.foods.length > 0) {
      console.log("in if");
      this.saveDay.show();
    } else {
      this.saveDay.hide();
    }
    this.lastSearchInput = '';
    this.lastSearchRangeStart = 0;

    var calCount = 0;

    app.foods.each(function(food) {
      calCount += food.get('calories');
      var foodView = new app.FoodView({model: food});
      self.foodtable.append(foodView.render().el);
    });

    self.foodtable.append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');
  },

  createSearchResults: function( event ) {

    if (self.useLastSearchInput) {
      var searchInput = self.lastSearchInput;
    } else {
      if ( event.which !== ENTER_KEY || !this.$searchbar.val().trim() ) {
        return;
      }
      var searchInput = this.$searchbar.val().trim();
      self.lastSearchInput = searchInput; // saved for more searches.
      app.searchresults.reset();
    }

    var range = '' + self.rangeStart + ':' + self.rangeEnd + '';

    var nutQuery = 'https://api.nutritionix.com/v1_1/search/' + searchInput + '?results=' + range + '&fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=c6f2c498&appKey=63a855793383d6e263e27c9993661a29'
    $.getJSON(nutQuery)
      .done(function(data) {
        for (var i = 0; i < data.hits.length; i++) {
          app.searchresults.create( {
            name: data.hits[i].fields.item_name,
            calories: Math.floor(data.hits[i].fields.nf_calories)
          });
        };
      })
      .fail(function() {
          app.searchresults.create( {
            name: "No results",
            calories: 0
          });
      });

    this.$searchbar.val('');
    self.useLastSearchInput = false;
  },

  // Add the search results to view.
  // Add "Show More Matches" button too.

  addSearchResults: function() {
    self.$("#searchresultslist li").remove();

    app.searchresults.each(function(result) {
      var searchresultView = new app.SearchResultView({model: result});
      self.searchresultslist.append(searchresultView.render().el);
    });

    self.showMoreResults.show();
  },

  createMoreSearchResults: function() {
    self.rangeStart += 3;
    self.rangeEnd += 3;
    self.useLastSearchInput = true;
    this.createSearchResults();
  },

  addSavedDay: function() {
    self.savedDaysCount++;
    app.foodsSavedDay = app.foods.clone();
    var calCount = 0;

    if ( self.savedDaysCount % 4 === 1 && self.savedDaysCount > 1 ) {
      self.savedDayRow.after('<section class="row saved-days-row"></section>');
      self.savedDayRow = $('.saved-days-row:last');
    }

    self.savedDayRow.append('<div class="col-xs-12 col-sm-6 col-md-3"><div>Day ' + self.savedDaysCount + '</div><table class="table table-striped table-bordered table-condensed table-hover table-day' + self.savedDaysCount + '"><tbody><tr><th>Food</th><th>Calories</th></tr>');

    app.foodsSavedDay.each(function(food) {
      calCount += food.get('calories');
      var foodSavedDayView = new app.FoodSavedDayView({model: food});
      $('.table-day' + self.savedDaysCount + ' tbody').append(foodSavedDayView.render().el);
    });

    $('.table-day' + self.savedDaysCount + ' tbody').append('<tr id="table-total-row"><th>Total</th><th id="total">' + calCount + '</th></tr>');

    self.savedDayRow.append('</tbody></table></div>');

    app.foodsSavedDay.reset();
    app.foods.reset();
  }
});
