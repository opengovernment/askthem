require "democracy_map_governor_adapter"

class Governor < Person
  def self.default_api
    DemocracyMapGovernorService
  end

  def self.load_governors
    # drop non-states from array
    # @todo evaluate how to handle pr (think has governor,
    # but doesn't show up in dm data)
    states = OpenGovernment::STATES.values - ["dc", "pr"]
    states.collect { |state| load_from_apis_for_jurisdiction(state) }
  end

  private
  def adapt(attributes, options = {})
    adapter = options[:adapter] || DemocracyMapGovernorAdapter.new(self)
    super(attributes, options.merge({ adapter: adapter }))
  end
end
