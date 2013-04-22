class SubjectsController < ApplicationController
  before_filter :set_jurisdiction

  def index
    @subjects = SUBJECTS.values
  end

  def show
    @subject = SUBJECTS.fetch(params[:subject])

    @bills = Bill.where({
      state: @jurisdiction.id,
      session: @jurisdiction.current_session,
      subjects: @subject,
    }).desc('action_dates.last').page(params[:page])
  end

  # @note Can't do `Bill.distinct('subjects')` because OpenStates has
  #   inconsistent subject names (typos, missing commas and words, etc.).
  SUBJECTS = Hash[*[
    'Agriculture and Food',
    'Animal Rights and Wildlife Issues',
    'Arts and Humanities',
    'Budget, Spending, and Taxes',
    'Business and Consumers',
    'Campaign Finance and Election Issues',
    'Civil Liberties and Civil Rights',
    'Commerce',
    'Crime',
    'Drugs',
    'Education',
    'Energy',
    'Environmental',
    'Executive Branch',
    'Family and Children Issues',
    'Federal, State, and Local Relations',
    'Gambling and Gaming',
    'Government Reform',
    'Guns',
    'Health',
    'Housing and Property',
    'Immigration',
    'Indigenous Peoples',
    'Insurance',
    'Judiciary',
    'Labor and Employment',
    'Legal Issues',
    'Legislative Affairs',
    'Military',
    'Municipal and County Issues',
    'Nominations',
    'Other',
    'Public Services',
    'Recreation',
    'Reproductive Issues',
    'Resolutions',
    'Science and Medical Research',
    'Senior Issues',
    'Sexual Orientation and Gender Issues',
    'Social Issues',
    'State Agencies',
    'State Agency',
    'Technology and Communication',
    'Trade',
    'Transportation',
    'Welfare and Poverty',
  ].map do |subject|
    [subject.parameterize, subject]
  end.flatten]
end
