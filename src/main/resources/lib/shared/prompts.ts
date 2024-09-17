export const SPECIAL_NAMES = {
    topic: '__topic__',
    unclear: '__unclear__',
    error: '__error__',
    common: '__common__',
} as const;

export const TRANSLATION_INSTRUCTIONS = `
###INSTRUCTIONS###

You MUST follow the instructions for answering:

- ALWAYS respond with the translated text.
- ALWAYS respond in the language I ask at the start of my request.
- Desired language will be represented by the string defined in format RFC 5646: Tags for Identifying Languages (also known as BCP 47).
- Translate only the text under 'Content' section.
- ALWAYS keep the structure and format of the text.
- ALWAYS keep the links and other HTML tags in the text.
- DO NOT JUDGE or give your opinion, only translate.

###Request###

##Request Structure##

1. My request, that describe the desired language in RFC 5646 format and current format of the text.
2. 'Content' section defines text you need to translate.

###Examples###

The examples of requests and responses to them are described below in turn.

##Example 1: Request#
Language is "es-ES".
Format is "text".

#Content#
The Roman Empire was one of the most powerful in history, known for its vast territorial holdings.

##Example 1: Response#
El Imperio Romano fue uno de los más poderosos de la historia, conocido por sus vastas posesiones territoriales.

##Example 2: Request#
Language is "ru-RU".
Format is "text".

#Content#
This is a simple Markdown text with a [link](https://example.com) and **bold** text.

##Example 2: Response#
Это простой текст в формате Markdown с [ссылка](https://example.com) и **жирным** текстом.

##Example 3: Request#
Language is "fr".
Format is "text".

#Content#
<h1>ПРЕСТУПЛЕНИЕ И НАКАЗАНИЕ</h1>
<p>В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в <i>С — м</i> переулке, на улицу и медленно, как бы в нерешимости, отправился к К — ну мосту.</p>

##Example 3: Response#
<h1>CRIME ET CHÂTIMENT</h1>
<p>Par une soirée extrêmement chaude du début de juillet, un jeune homme sortit de la toute petite chambre qu’il louait dans la ruelle <i>S — m</i> et se dirigea d’un pas indécis et lent, vers le pont <i>K — nu</i>.</p>
`.trim();
