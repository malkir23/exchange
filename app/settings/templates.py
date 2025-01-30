from fastapi.templating import Jinja2Templates

def get_templates():
	return Jinja2Templates(directory="app/templates")

