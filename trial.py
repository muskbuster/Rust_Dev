# import libraries to make get request
import requests
import json

# Replace 'YOUR_API_KEY_HERE' with your Discord API token
h = {'authorization': 'ODI5MzYzODU3MDgzNzI3OTYy.GWOUFB.qMACnPNPxEtTAyu1fSi9X6zC-qcQ0sifGbJ6jg'} 

# Replace 'YOUR_SERVER_ID_HERE' with your server's ID
server_id = '935678348330434570'

# Replace 'YOUR_CHANNEL_ID_HERE' with your channel's ID
channel_id = '935678348330434570'

# approximate_member_count (count of server members)
def get_approximate_member_count(server_id):
    r = requests.get(f'https://discord.com/api/guilds/{server_id}/preview', headers=h)
    j = json.loads(r.text)
    return j['approximate_member_count']

# approximate_presence_count (count of currently online server members)
def get_approximate_presence_count(server_id):
    r = requests.get(f'https://discord.com/api/guilds/{server_id}/preview', headers=h)
    j = json.loads(r.text)
    return j['approximate_presence_count']

# get the text content of the last 10 messages posted to a specific channel
def get_last_10_messages_from_channel(channel_id):
    r = requests.get(f'https://discord.com/api/v9/channels/{channel_id}/messages?limit=10', headers=h)
    j = json.loads(r.text)
    m = [c['content'] for c in j]
    return m

if __name__ == "__main__":
    member_count = get_approximate_member_count(server_id)
    print(f"Approximate Member Count: {member_count}")

    presence_count = get_approximate_presence_count(server_id)
    print(f"Approximate Presence Count: {presence_count}")