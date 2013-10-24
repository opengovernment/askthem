class RegistrationsController < Devise::RegistrationsController
  layout 'data_collection'

  # based on https://github.com/plataformatec/devise/blob/master/app/controllers/devise/registrations_controller.rb#L12
  def create
    person_id = params[:user].delete(:person_id)

    build_resource(sign_up_params)

    if resource.save
      if resource.active_for_authentication?
        set_flash_message :notice, :signed_up if is_navigational_format?
        sign_up(resource_name, resource)

        if person_id
          Identity.create(user: resource, person_id: person_id).submit!
        end

        if params[:question_id]
          add_signature_to_question resource, params[:question_id]
        else
          respond_with resource, :location => after_sign_up_path_for(resource)
        end
      else
        set_flash_message :notice, :"signed_up_but_#{resource.inactive_message}" if is_navigational_format?
        expire_session_data_after_sign_in!
        respond_with resource, :location => after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords resource
      respond_with resource
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

  def add_signature_to_question(user, question_id)
    if question_id
      question = Question.find(question_id)
      user.signatures.new(question_id: question.id).save
      respond_with user, :location => question_path(question.state, question.id, :share => true)
    end
  end
end
