import copy
import datetime
import math
import random

from django.http import HttpResponse
from django.shortcuts import redirect, render

# Create your views here.
rooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
running_rooms = []
game_rooms = []
POSSIBLE_ANSWERS = ['Prasun', 'Prachi', 'Achyut', 'Shanta', 'oven', 'night', 'weary', 'breath',
                    'string', 'tickle', 'bright', 'pumped', 'smile', 'languid', 'calculate', 'destruction', ]


def home(request):
    username = ''
    if request.method == 'GET':
        return render(request, 'home.html')
    elif request.method == 'POST':
        username = request.POST['username']
        if 'aashraya' in username.lower():
            return render(request, 'home.html')
        if 'create' in request.POST:
            room = createRoom(username, True)
        elif 'play' in request.POST:
            room = let_the_user_play(username)
        elif 'join_game' in request.POST:
            link = request.POST['link']
            if link == '':
                room = let_the_user_play(username)
            elif not 'sektchit.com/id=' in link:
                return render(request, 'home.html')
            elif 'sektchit.com/id=' in link:
                room = link.split('=')
                try:
                    room = int(room[-1])
                    room = let_the_user_play(username, room)
                except:
                    return render(request, 'home.html')

        return redirect(f'/id={room}')


def maingame(request, id):
    try:
        userToVerify = request.POST['userToVerify']
    except:
        userToVerify = ' '
    try:
        id = int(id[-1])
    except:
        return render(request, 'home.html')
    if rooms.count(id) > 0:
        return render(request, 'home.html')
    else:
        for game_room in game_rooms:
            if game_room['id'] == id:
                userdata = game_room['userdata']
                username = userdata[-1]['username']
                chats = game_room['chats']
                rounds = game_room['round']
                newRound = game_room['newRound']
                artist = game_room['artist']
                word = game_room['word']
                endTime = game_room['endingTime']
                canvasImage = game_room['canvasImage']
                blankWord = ''
                leaders = leaders_sort(userdata)
                if newRound and len(userdata) > 1:
                    try:
                        groupData = gamemanager(game_room)
                        artist = groupData[0]
                        word = groupData[1]
                        endTime = groupData[2]
                    except:
                        rounds = game_room['round']
                blankWord = blankword(word, artist == userToVerify)
                try:
                    time = math.ceil(
                        (endTime - datetime.datetime.now()).total_seconds())
                    if time < 0:
                        time = 0
                        if not 'The word was' in game_room['chats'][0][1]:
                            internal_chat_update(
                                None, game_room['id'], f'The word was {word}.', 'system_chat')
                        game_room['newRound'] = True
                except:
                    time = 90
        return render(request, 'maingame.html', {'userdata': userdata, 'liveusername': username, 'userToVerify': userToVerify, 'chats': chats, 'leaders': leaders, 'artist': artist, 'blankWord': blankWord, 'time': time, 'canvasImage': canvasImage, 'rounds': rounds})


def let_the_user_play(username, room=None):
    try:
        if not room:
            room = random.choice(running_rooms)
        for game_room in game_rooms:
            if game_room['id'] == room:
                if len(game_room['userdata']) < 10:
                    game_room['userdata'].append(
                        {'username': username, 'points': 0})
                else:
                    raise Exception
    except:
        try:
            room = createRoom(username, False)
        except:
            return redirect("/")

    return room


def createRoom(username, personal_room):
    users = []
    userdata: dict = {'username': '', 'points': 0}
    userdata['username'] = username
    users.append(userdata)
    room = random.choice(rooms)
    rooms.remove(room)
    if not personal_room:
        running_rooms.append(room)
    game_room = {'id': room, 'userdata': users, 'chats': [],
                 'leaders': [], 'artist': ' ', 'word': '', 'endingTime': '', 'round': 0, 'newRound': True, 'canvasImage': ''}
    game_rooms.append(game_room)
    return room


def internal_chat_update(chatting_user, game_id, chat, css_class):
    guessed = False
    if css_class == 'right_guess':
        guessed = True
        point_incrementor(username=chatting_user, game_room_id=game_id)
    for game_room in game_rooms:
        if game_room['id'] == int(game_id):
            game_room['chats'].insert(
                0, [chatting_user, chat, css_class, guessed])


def point_incrementor(username, game_room_id):
    for game_room in game_rooms:
        if game_room['id'] == int(game_room_id):
            for data in game_room['userdata']:
                if data['username'] == username:
                    data['points'] += 100
            leaders = leaders_sort(game_room['userdata'])
            try:
                leaders = leaders[:4]
            except:
                pass
            game_room['leaders'] = leaders


def leaders_sort(gameroom_userdata):
    sorted_uerdata = copy.deepcopy(gameroom_userdata)
    topperChanged = False
    for i in range(len(gameroom_userdata)):
        topper = sorted_uerdata[i]
        for j in range(len(sorted_uerdata) - 1, -1 + i, -1):
            if gameroom_userdata[j]['points'] > topper['points']:
                topperChanged = True
                topper = sorted_uerdata[j]
                indexValue = sorted_uerdata.index(topper)
        if topperChanged:
            sorted_uerdata[i], sorted_uerdata[indexValue] = sorted_uerdata[indexValue], sorted_uerdata[i]
            topperChanged = False
    return sorted_uerdata


def gamemanager(gameroom):
    gameroom['round'] += 1
    if gameroom['round'] > 5:
        gameroom['round'] = 5
        return gameroom['round']
    else:
        wordToGuess = random.choice(POSSIBLE_ANSWERS)
        artistUser = random.choice(gameroom['userdata'])
        artistUser = artistUser['username']
        now = datetime.datetime.now()
        gametimeSeconds = 90
        gameDuration = datetime.timedelta(seconds=gametimeSeconds)
        endingTime = now + gameDuration
        internal_chat_update(
            None, gameroom['id'], f'---------- ROUND : {gameroom["round"]} ----------', 'system_chat')
        internal_chat_update(
            None, gameroom['id'], f'{artistUser} is drawing now', 'system_chat')
        gameroom['newRound'] = False
        gameroom['artist'] = artistUser
        gameroom['word'] = wordToGuess
        gameroom['endingTime'] = endingTime
        return artistUser, wordToGuess, endingTime


def blankword(word, artistProof):
    result = ''
    if word == '':
        return word
    if artistProof:
        result = "<b style='font-size : 25px;'>" + word + '</b>'
    else:
        result = '__ ' * len(word)
        result = "<b>" + result + "</b>"
    return result


def answercheck(request):
    if request.method == 'POST':
        guess = request.POST['guess']
        chatter = request.POST['username']
        game_id = request.POST['id']
        for gameroom in game_rooms:
            if chatter == gameroom['artist']:
                return HttpResponse('')
            if gameroom['id'] == int(game_id):
                word = gameroom['word']
                if guess.lower() == word.lower():
                    internal_chat_update(
                        chatter, game_id, guess, 'right_guess')
                else:
                    internal_chat_update(
                        chatter, game_id, guess, 'wrong_guess')
                return HttpResponse('')

    else:
        render(request, 'home.html')


def canvasdata(request):
    if request.method == 'POST':
        canvasImage = request.POST['image']
        game_id = request.POST['id']
        for game_room in game_rooms:
            if game_room['id'] == int(game_id):
                game_room['canvasImage'] = canvasImage
        return HttpResponse('')
    else:
        render(request, 'home.html')


def pageexit(request):
    if request.method == 'POST':
        username = request.POST['username']
        game_id = request.POST['id']
        for gameroom in game_rooms:
            if gameroom['id'] == int(game_id):
                for user in gameroom['userdata']:
                    if user['username'] == username:
                        gameroom['userdata'].remove(user)
                        if len(gameroom['userdata']) == 0:
                            game_rooms.remove(gameroom)
                            rooms.append(gameroom['id'])
                            running_rooms.remove(gameroom['id'])
        return HttpResponse('')
    else:
        render(request, 'home.html')


def suggestions(request):
    if request.method == 'POST':
        suggestions = request.POST['suggestions']
        with open('suggestions.txt', 'a') as suggestionsFile:
            suggestionsFile.write(suggestions + '\n')
    return redirect('/')
