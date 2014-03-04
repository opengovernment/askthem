require "spec_helper"

describe BlurbsController do
  let(:valid_attributes) { { headline: "Test", body: "Test body" } }

  context "a logged out user" do
    describe "GET index" do
      it "should refuse access" do
        get :index
        expect(response.code).to eq("302")
      end
    end

    describe "GET show" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        get :show, id: blurb.id
        expect(response.code).to eq("302")
      end
    end

    describe "GET new" do
      it "should refuse access" do
        get :new
        expect(response.code).to eq("302")
      end
    end

    describe "GET edit" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        get :edit, id: blurb.id
        expect(response.code).to eq("302")
      end
    end

    describe "POST create" do
      it "should refuse access" do
        post :create, blurb: {}
        expect(response.code).to eq("302")
      end
    end

    describe "PUT update" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        put :update, id: blurb.id, blurb: {}
        expect(response.code).to eq("302")
      end
    end

    describe "DELETE destroy" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        delete :destroy, id: blurb.id
        expect(response.code).to eq("302")
      end
    end
  end

  context "and not logged in as staff member" do
    before do
      @user = FactoryGirl.create(:user)
      sign_in @user
    end

    describe "GET index" do
      it "should refuse access" do
        get :index
        expect(response.code).to eq("403")
      end
    end

    describe "GET show" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        get :show, id: blurb.id
        expect(response.code).to eq("403")
      end
    end

    describe "GET new" do
      it "should refuse access" do
        get :new
        expect(response.code).to eq("403")
      end
    end

    describe "GET edit" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        get :edit, id: blurb.id
        expect(response.code).to eq("403")
      end
    end

    describe "POST create" do
      it "should refuse access" do
        post :create, blurb: {}
        expect(response.code).to eq("403")
      end
    end

    describe "PUT update" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        put :update, id: blurb.id, blurb: {}
        expect(response.code).to eq("403")
      end
    end

    describe "DELETE destroy" do
      it "should refuse access" do
        blurb = FactoryGirl.create(:blurb)
        delete :destroy, id: blurb.id
        expect(response.code).to eq("403")
      end
    end
  end

  context "and logged in as staff member" do
    before do
      @staff_member = FactoryGirl.create(:user)
      @staff_member.add_role :staff_member
      sign_in @staff_member
    end

    describe "GET index" do
      it "should show list of blurbs" do
        blurb = FactoryGirl.create(:blurb)
        get :index
        assigns(:blurbs).should eq([blurb])
      end
    end

    describe "GET show" do
      it "assigns the requested blurb as @blurb" do
        blurb = FactoryGirl.create(:blurb)
        get :show, id: blurb.id
        assigns(:blurb).should eq(blurb)
      end
    end

    describe "GET new" do
      it "assigns a new blurb as @blurb" do
        get :new
        assigns(:blurb).should be_a_new(Blurb)
      end
    end

    describe "GET edit" do
      it "assigns the requested blurb as @blurb" do
        blurb = FactoryGirl.create(:blurb)
        get :edit, id: blurb.id
        assigns(:blurb).should eq(blurb)
      end
    end

    describe "POST create" do
      describe "with valid params" do
        it "creates a new Blurb" do
          expect {
            post :create, blurb: valid_attributes
          }.to change(Blurb, :count).by(1)
        end

        it "assigns a newly created blurb as @blurb" do
          post :create, blurb: valid_attributes
          assigns(:blurb).should be_a(Blurb)
          assigns(:blurb).should be_persisted
        end

        it "redirects to the created blurb" do
          post :create, blurb: valid_attributes
          response.should redirect_to(Blurb.last)
        end
      end

      describe "with invalid params" do
        it "assigns a newly created but unsaved blurb as @blurb" do
          post :create, blurb: {  }
          assigns(:blurb).should be_a_new(Blurb)
        end

        it "re-renders the 'new' template" do
          post :create, :blurb => {  }
          response.should render_template("new")
        end
      end
    end

    describe "PUT update" do
      describe "with valid params" do
        it "updates the requested blurb" do
          blurb = FactoryGirl.create(:blurb)
          put :update, id: blurb.id, blurb: valid_attributes.merge({ headline: "New and Improved!"})
          expect(blurb.reload.headline).to eq "New and Improved!"
        end

        it "assigns the requested blurb as @blurb" do
          blurb = FactoryGirl.create(:blurb)
          put :update, id: blurb.id, blurb: blurb.attributes
          assigns(:blurb).should eq(blurb)
        end

        it "redirects to the blurb" do
          blurb = FactoryGirl.create(:blurb)
          put :update, id: blurb.id, blurb: valid_attributes
          response.should redirect_to(blurb)
        end
      end
    end

    describe "DELETE destroy" do
      it "destroys the requested blurb" do
        blurb = FactoryGirl.create(:blurb)
        expect {
          delete :destroy, id: blurb.id
        }.to change(Blurb, :count).by(-1)
      end

      it "redirects to the blurbs list" do
        blurb = FactoryGirl.create(:blurb)
        delete :destroy, id: blurb.id
        response.should redirect_to(blurbs_url)
      end
    end
  end
end
