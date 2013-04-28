class RegistrationsController < Devise::RegistrationsController
  # @todo move this into its own controller
  def create
    if params.key?(:question_id)
      @question = Question.new(state: 'ak')
      if @question
        build_resource

        # @todo js: hide form if successful, display errors if validation fails
        if resource.save
          set_flash_message :notice, :signed_up if is_navigational_format?
          sign_in(resource_name, resource)
          respond_with resource, location: question_path(@question.state, @question.id)
        else
          clean_up_passwords resource
          respond_with(resource, location: question_path(@question.state, @question.id)) do |format|
            format.html do
              @jurisdiction = Metadatum.find_by_abbreviation(@question.state)
              render 'questions/show'
            end
          end
        end
      else
        super
      end
    else
      super
    end
  end

  # Unlike Devise, no destruction (until we sort out orphaned content).
  def destroy
    not_found
  end

private

  def after_update_path_for(resource)
    user_path(resource)
  end
end
