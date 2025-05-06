import hurdat2parser as hd2
import json
import code
import html
import io
import contextlib

def drop_to_shell(leave=True):
    code.interact(local=globals())
    if leave:
        exit()

# import the hurdat2 database text file into the hurdat2 parser object */
atl = hd2.Hurdat2("hurdat2-1851-2024-040425.txt")


print(atl)
year2022 = atl[2022]
hurricane_ian = year2022["Ian"]




def extract_hurricane_entry_data(hurdat2hurricane):
    current_entry_data = {}
    entry_data = []

    for tc in hurdat2hurricane:
        current_entry_data = {}
        current_entry_data["index"] = tc.index
        current_entry_data["lat"] = tc.lat
        current_entry_data["lon"] = tc.lon
        current_entry_data["pressure"] = tc.mslp # mean sea level pressure
        current_entry_data["datetime"] = tc.date.strftime('%Y-%m-%dT%H:%M:%S%z')
        current_entry_data["status"] = tc.status
        current_entry_data["category"] = tc.saffir_simpson
        current_entry_data["wind"] = tc.wind

        entry_data.append(current_entry_data)
    return entry_data

def save_hurricane_json(hurdat2hurricane):
    name = hurdat2hurricane.record_identifier
    data = extract_hurricane_entry_data(hurdat2hurricane)

    print(json.dumps(data,indent=4))

    with open(f"{name}.json", 'w') as file:
        json.dump(data, file, indent=4)

def extract_season(hurdat2season):
    season_data = {}
    for storm_id in hurdat2season.tc.keys():
        hurricane = hurdat2season.tc[storm_id]
        hurricane_data = {}
        hurricane_data["name"] = hurricane.name
        hurricane_data['id'] = storm_id
        hurricane_data["entries"] = extract_hurricane_entry_data(hurricane)
        hurricane_data["info"] = format_stats_to_html(save_print_output(hurricane.info))
        season_data[storm_id] = hurricane_data
        
    summary_str = save_print_output(hurdat2season.summary)
    print(summary_str)
    season_data["summary"] = format_stats_to_html(summary_str)
    return season_data


def save_seasons(data, seasonlist):
    output_data = {}
    for season in seasonlist:
        hurricane_season = data[season]
        
        output_data[season] = extract_season(hurricane_season)
    
    with open(f"temp.json", 'w') as file:
        json.dump(output_data, file, indent=4)

def save_all(data):
    output_data = {}
    for season in data.season.keys():
        hurricane_season = data[season]
        
        output_data[season] = extract_season(hurricane_season)
    
    with open(f"all_seasons.json", 'w') as file:
        json.dump(output_data, file, indent=4)


def format_stats_to_html(stats_text: str) -> str:
    # Escape HTML-sensitive characters 
    escaped_text = html.escape(stats_text)
    
    html_output = f"""
        <div class="custominfo" style="padding:1em; border-radius:5px; overflow-x:auto; font-family:monospace; white-space:pre; font-size:16px">{escaped_text}</div>
    """.strip()

    return html_output


def save_print_output(func):
    string_io = io.StringIO()
    with contextlib.redirect_stdout(string_io):
        func()
    return string_io.getvalue()



def save_all_seasons(data):
    for season in data.season.keys():
        
        hurricane_season = data[season]
        
        output_data = extract_season(hurricane_season)
    
        with open(f"seasons/{season}.json", 'w') as file:
            json.dump(output_data, file, indent=4)

# save_seasons(atl,[2021,2022])
# drop_to_shell()
save_all_seasons(atl)
save_all(atl)
print("done")