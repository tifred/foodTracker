// js/views/saveday.js

var app = app || {};

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




