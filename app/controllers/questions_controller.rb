class QuestionsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show, :new
end
