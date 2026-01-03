module EmailHelper
  def encode_email(email)
    email.gsub(/./) { sprintf("&#x%02X;", $&.unpack("U")[0]) }
  end
end
