// js/views/saveday.js

var app = app || {};

/*
    app.FoodSavedDayView: adds table data for foods to a "saved day".
    This is a hack of an implementation, I know.
*/

app.FoodSavedDayView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($('#saved-days-template').html()),

  events: {
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }

});




