// js/collections/searchresults.js

var app = app || {};

var SearchResults = Backbone.Collection.extend({
  model: app.SearchResult,
  localStorage: new Backbone.LocalStorage('searchresults-backbone'),
});

app.searchresults = new SearchResults([]);
