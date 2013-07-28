class Subject
  # @return [Array<String>] the list of OpenStates subjects
  # @see https://github.com/sunlightlabs/openstates/wiki/Categorization#subjects
  # alternatively we could populate this
  # with Bill.distinct('subject').sort
  def self.all
    [ # In both OpenStates and VoteSmart:     # Additional VoteSmart subjects:
      'Agriculture and Food',
      'Business and Consumers',
      'Civil Liberties and Civil Rights',     # Women
      'Crime',
      'Drugs',
      'Education',
      'Energy',
      'Executive Branch',                     # Foreign Affairs
      'Gambling and Gaming',
      'Guns',
      'Housing and Property',
      'Immigration',
      'Technology and Communication',
      'Trade',
      'Transportation',

      # Differences:                          # Corresponding VoteSmart subjects:
      'Animal Rights and Wildlife Issues',    # Animals and Wildlife
      'Arts and Humanities',                  # Arts and Entertainment
      'Budget, Spending, and Taxes',          # Budget, Spending and Taxes
      'Campaign Finance and Election Issues', # Campaign Finance and Elections
      'Environmental',                        # Environment
      'Family and Children Issues',           # Marriage, Family, and Children
      'Federal, State, and Local Relations',  # Federal, State and Local Relations
      'Government Reform',                    # Government Operations
      'Health',                               # Health and Health Care
      'Labor and Employment',                 # Employment and Affirmative Action | Labor Unions
      'Judiciary',                            # Judicial Branch
      'Legislative Affairs',                  # Legislative Branch
      'Military',                             # Defense | Military Personnel | National Security | Veterans
      'Reproductive Issues',                  # Abortion | Abortion and Reproductive
      'Science and Medical Research',         # Science
      'Senior Issues',                        # Senior Citizens
      'Sexual Orientation and Gender Issues', # Sexual Orientation and Gender Identity
      'Social Issues',                        # Social
      'Welfare and Poverty',                  # Unemployed and Low-Income

      # In OpenStates only:
      'Commerce',
      'Indigenous Peoples',
      'Insurance',
      'Legal Issues',
      'Municipal and County Issues',
      'Nominations',
      'Other',
      'Public Services',
      'Recreation',
      'Resolutions',
      'State Agencies',

      # In VoteSmart only:
      # Conservative
      # Liberal
    ].sort
  end
end
