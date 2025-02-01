from datetime import datetime

def date_format():
	formatted_date = datetime.today().strftime("%d-%m-%Y")
	formatted_date = formatted_date if formatted_date[0] != "0" else formatted_date[1:]
	formatted_date = formatted_date.replace("-0", "-")
	return formatted_date
