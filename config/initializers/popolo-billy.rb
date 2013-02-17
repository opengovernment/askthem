if Rails.env.production?
  Popolo::Billy.level_field = 'jurisdiction'
else
  Popolo::Billy.level_field = 'state'
end
