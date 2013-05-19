module QuestionsHelper
  # TODO: spec
  def step_class_for(step, relevant_steps)
    raw('class="not-first-step"') if relevant_steps.first.to_s != step
  end

  # @return [Array<String>] the list of Project Vote Smart subjects
  def subjects
    [
      'Abortion',
      'Abortion and Reproductive',
      'Agriculture and Food',
      'Animals and Wildlife',
      'Arts and Entertainment',
      'Budget, Spending and Taxes',
      'Business and Consumers',
      'Campaign Finance and Elections',
      'Civil Liberties and Civil Rights',
      'Conservative',
      'Crime',
      'Defense',
      'Drugs',
      'Education',
      'Employment and Affirmative Action',
      'Energy',
      'Environment',
      'Executive Branch',
      'Federal, State and Local Relations',
      'Foreign Affairs',
      'Gambling and Gaming',
      'Government Operations',
      'Guns',
      'Health and Health Care',
      'Housing and Property',
      'Immigration',
      'Judicial Branch',
      'Labor Unions',
      'Legislative Branch',
      'Liberal',
      'Marriage, Family, and Children',
      'Military Personnel',
      'National Security',
      'Science',
      'Senior Citizens',
      'Sexual Orientation and Gender Identity',
      'Social',
      'Technology and Communication',
      'Trade',
      'Transportation',
      'Unemployed and Low-Income',
      'Veterans',
      'Women',
    ]
  end
end
