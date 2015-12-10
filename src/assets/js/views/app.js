// js/views/app.js

var app = app || {};

app.AppView = Backbone.View.extend({

  el: $('main'),

  events: {
    'keypress #searchbar': 'addSearchResult',
    'click #showMoreResults': 'addMoreSearchResults',
    'click #saveDay': 'addSavedDay'
  },

  initialize: function() {
    self = this;
    this.$searchbar = $('#searchbar');
    this.searchresultslist = $('#searchresultslist');
    this.foodtable = $('#foodtable');
    this.showMoreResults = $('#showMoreResults');
    this.lastSearchInput = '';
    this.lastSearchRangeStart = 0;
    this.saveDay = $('#saveDay');
    this.savedDayRow = $('.saved-days-row');
    this.savedDaysCount = 0;

    this.listenTo(app.foods, 'add', this.render);
    this.listenTo(app.foods, 'remove', this.render);
    this.listenTo(app.foods, 'reset', this.render);
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

  addSearchResult: function( event ) {
    if ( event.which !== ENTER_KEY || !this.$searchbar.val().trim() ) {
      return;
    }

    app.searchresults.reset();
    self.$("#searchresultslist li").remove();

    var searchInput = this.$searchbar.val().trim();
    self.lastSearchInput = searchInput; // saved for more searches.

    var nutQuery = 'https://api.nutritionix.com/v1_1/search/' + searchInput + '?results=0:3&fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=c6f2c498&appKey=63a855793383d6e263e27c9993661a29'
    $.getJSON(nutQuery)
      .done(function(data) {
	for (var i = 0; i < data.hits.length; i++) {
          app.searchresults.create( {
	    name: data.hits[i].fields.item_name,
	    calories: Math.floor(data.hits[i].fields.nf_calories)
          } );
	};
	app.searchresults.each(function(result) {
	  var searchresultView = new app.SearchResultView({model: result});
	  self.searchresultslist.append(searchresultView.render().el);
	});
        self.showMoreResults.show();
    })
      .fail(function() {
	  self.searchresultslist.append('<div>Search Failed.</div>');
      });

    this.$searchbar.val('');
  },

  addMoreSearchResults: function() {
    var start = self.lastSearchRangeStart + 3;
    var end = start + 3;
    var range = '' + start + ':' + end + '';

    self.$("#searchresultslist li").remove();

    var nutQuery = 'https://api.nutritionix.com/v1_1/search/' + self.lastSearchInput + '?results=' + range + '&fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=c6f2c498&appKey=63a855793383d6e263e27c9993661a29'
    $.getJSON(nutQuery)
      .done(function(data) {
	for (var i = 0; i < data.hits.length; i++) {
          app.searchresults.create( {
	    name: data.hits[i].fields.item_name,
	    calories: Math.floor(data.hits[i].fields.nf_calories)
          } );
	};
	app.searchresults.each(function(result) {
	  var searchresultView = new app.SearchResultView({model: result});
	  self.searchresultslist.append(searchresultView.render().el);
	});
        self.showMoreResults.show();
        self.lastSearchRangeStart += 3;
    })
      .fail(function() {
	  self.searchresultslist.append('<div>Search Failed.</div>');
      });
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
