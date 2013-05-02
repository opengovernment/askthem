class QuestionsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create
  custom_actions resource: :preview

  def index
    index! do |format|
      format.js {render partial: 'page'}
    end
  end

  def show
    @user = User.new unless user_signed_in?
    show!
  end

private

  def end_of_association_chain
    Question.in(parent.abbreviation)
  end

  def collection
    @questions ||= Kaminari.paginate_array([stub] * 75).page(params[:page]) # @todo remove once we add some questions
    # end_of_association_chain.includes(:user).where(params.slice(:subject)).page(params[:page])
  end

  def resource # @todo remove once we add some questions
    @question ||= stub
  end

  def stub # @todo remove once we add some questions
    bill = Bill.in(parent.abbreviation).last
    Question.new({
      title: 'What for dost doth under thy venerable name?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu arcu augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras consequat, enim ac suscipit convallis, sem ligula molestie sem, nec adipiscing nulla leo id lacus. Donec in orci sed erat blandit ornare. Nunc non quam sit amet quam suscipit tristique sed a velit. Nunc cursus pellentesque lectus a tincidunt. Nam blandit, mi ac suscipit lobortis, mauris purus vulputate dui, ac volutpat sapien nibh nec nisl. Duis faucibus rutrum placerat. Pellentesque semper laoreet nisl eget hendrerit. Aliquam erat volutpat. Morbi ligula augue, vehicula ut fermentum in, porttitor sit amet sem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Phasellus eu varius tellus. Maecenas neque sem, egestas id venenatis nec, aliquam congue felis.',
      state: parent.abbreviation,
      subject: 'Health',
      user: User.first,
      person: Person.in(parent.abbreviation).last,
      bill: bill,
      bill_id: bill.try(:id),
      issued_at: 1.week.ago,
    })
  end
end
