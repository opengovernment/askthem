# coding: utf-8
require "carrierwave/processing/mime_types"

class MediaUploader < CarrierWave::Uploader::Base
  include CarrierWave::MimeTypes

  # @see https://github.com/evrone/carrierwave-video-thumbnailer
  # @requires ffmpegthumbnailer binary should be present on the PATH
  include CarrierWave::Video
  include CarrierWave::Video::Thumbnailer

  # Include RMagick or MiniMagick support:
  include CarrierWave::RMagick

  # Include the Sprockets helpers for Rails 3.1+ asset pipeline compatibility:
  include Sprockets::Helpers::RailsHelper
  include Sprockets::Helpers::IsolatedHelper

  process :set_content_type

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_white_list
   ImageSrcUrl::IMAGE_TYPES + VideoSrcUrl::VIDEO_TYPES
  end

  # @see https://github.com/opengovernment/askthem/issues/245
  # @todo make sure this works for both images and videos
  # version :thumb do
  #   process(thumbnail: [{ format: 'png',
  #                         quality: 10,
  #                         size: 192,
  #                         strip: true,
  #                         logger: Rails.logger }])

  #   def full_filename for_file
  #     png_name for_file, version_name
  #   end
  # end

  def png_name for_file, version_name
    %Q{#{version_name}_#{for_file.chomp(File.extname(for_file))}.png}
  end
end
