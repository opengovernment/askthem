# additional methods,etc that we want to inject into the class
GoogleCivicInfo::Office

module GoogleCivicInfo
  class Office
    # president, vice president, etc.
    def is_federal_executive_or_judicial?
      if levels.present?
        (levels.include?("country") &&
         !(roles.include?("legislatorLowerBody") ||
           roles.include?("legislatorUpperBody")))
      end
    end

    def is_federal_legislator?
      if levels.present?
        (levels.include?("country") &&
         (roles.include?("legislatorLowerBody") ||
          roles.include?("legislatorUpperBody")))
      else
        name.downcase.include?("united states house of representatives") ||
          name.downcase.include?("united states senate")
      end
    end

    def is_state_legislator?
      if levels.present?
        (levels.include?("administrativeArea1") &&
         (roles.include?("legislatorLowerBody") ||
          roles.include?("legislatorUpperBody")))
      else
        name.downcase.include?("state house") ||
          name.downcase.include?("state senate")
      end
    end

    def is_state_senator?
      if levels.present?
        levels.include?("administrativeArea1") &&
          roles.include?("legislatorUpperBody")
      else
        name.downcase.include?("state senate")
      end
    end

    def is_governor?
      if levels.present?
        (levels.include?("administrativeArea1") &&
         roles.include?("headOfGovernment"))
      else
        name.downcase == "governor"
      end
    end

    def is_mayor?
      if levels.present?
        ((levels.include?("locality") ||
          levels.include?("administrativeArea2")) &&
         roles.include?("headOfGovernment"))
      else
        name.downcase == "mayor"
      end
    end

    def is_councilmember?
      if levels.present?
        (levels.include?("locality") ||
         levels.include?("subLocality1") ||
         levels.include?("administrativeArea2")) &&
          (roles.include?("legislatorUpperBody") ||
           roles.include?("legislatorLowerBody") ||
           roles.include?("executiveCouncil"))
      else
        name.downcase.include?("council") ||
          name.downcase.include?("alder")
      end
    end
  end

  class Division
    def is_county?
      ocd_division_id.split("/").last.include?("county")
    end
  end
end
