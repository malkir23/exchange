from datetime import datetime, timedelta

def date_format():
	formatted_date = datetime.today().strftime("%m/%d/%Y")
	return formatted_date if formatted_date[0] != "0" else formatted_date[1:]

def previous_date():
	previous_date = (datetime.today() - timedelta(days=1)).strftime("%m/%d/%Y")
	return previous_date if previous_date[0] != "0" else previous_date[1:]
