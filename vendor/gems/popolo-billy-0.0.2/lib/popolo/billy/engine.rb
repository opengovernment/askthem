module Popolo
  module Billy
    class Engine < ::Rails::Engine
      isolate_namespace Popolo::Billy

      config.to_prepare do
        Decorators.register! Engine.root, Rails.root
      end
    end
  end
end
