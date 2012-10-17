#!/usr/bin/env ruby
# Last.fm Playlist Generator 0.1b (Nov 08)
# by: Murat Ayfer www.muratayfer.com
require 'net/http'
require 'rexml/document'
require 'uri'

$script_name = "Last.fm Playlist Generator"
$api_key = "e67fe006cf952c670bdf0240d2435408"

begin
	require 'taglib'
rescue LoadError
	error = "#{$script_name}: \n
			ruby-taglib is required to run this script. \n
			On Ubuntu, you can install it using: 'apt-get install libtagc0-ruby'"
	`dcop amarok playlist popupMessage "#{error}"`
	exit
end

# menu items
$menu_title = "Generate Last.fm Playlist"
$menu_items = [
	"Filter selected songs",
	#"Best songs similar to selected artists"
]
# every kdialog should have the amarok icon and script title.
$dialog = "kdialog --icon amarok --title \"#{$script_name}\""
$progress_dialog = ""
# cached data will go in here to minimize the number of XML downloads
$xml_cache = Hash[
	"top_tracks" => Hash[]
]

# call the cleanup function when amarok or the script is terminated
def cleanup()
	$menu_items.each do |menu_item|
		`dcop amarok script removeCustomMenuItem "#{$menu_title}" "#{menu_item}"`
	end
end
trap( "SIGTERM" ) { cleanup() }

# function called at start of script
def init()
	cleanup()
	$menu_items.each do |menu_item|
		`dcop amarok script addCustomMenuItem "#{$menu_title}" "#{menu_item}"`
	end
end

class Song
	def initialize(file, artist, title)
		@file = file
		@artist = artist.downcase
		@title = title.downcase
	end
	def file
		@file
	end
	def file=(file)
		@file = file
	end
	def artist
		@artist
	end
	def artist=(artist)
		@artist = artist.downcase
	end
	def title
		@title
	end
	def title=(title)
		@title = title.downcase
	end
	def album
		@album
	end
	def album=(album)
		@album = album.downcase
	end
	def rank
		@rank
	end
	def rank=(rank)
		@rank = rank
	end
	def same_song(other_song)
		if @artist == other_song.artist && @title == other_song.title
			result = true
		else
			result = false
		end
		result
	end
	def in_array(array)
		result = false
		array.each do |song|
			if self.same_song(song)
				result = true
			end
		end
		result
	end
	def <=> other
		self.rank.to_i <=> other.rank.to_i
	end
	def to_s
		file
	end
end

def get_song_rank(song)
	begin
		# udate the cache if this artist hasn't been looked up before
		if !$xml_cache["top_tracks"][song.artist]
			puts "Getting XML for top tracks: " + song.artist + "\n"
			uri = URI.parse("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=#{URI.escape(song.artist)}&api_key=#{$api_key}")
			xml_data = Net::HTTP.get_response(uri).body
			$xml_cache["top_tracks"].merge!({"#{song.artist}" => REXML::Document.new(xml_data)})
		end
	rescue
		return FALSE
	end
	titles = []
	$xml_cache["top_tracks"][song.artist].elements.each('lfm/toptracks/track/name') do |title|
		titles << title.text
	end
	ranks = []
	$xml_cache["top_tracks"][song.artist].elements.each('lfm/toptracks/track') do |track|
		ranks << track.attributes["rank"]
	end
	
	rank = nil
	titles.each_with_index do |title, index|
		if title.downcase == song.title.downcase
			rank = ranks[index]
		end
	end
	
	rank
end

init()
#main
loop do
	# amarok sends messages to the stdin of scripts when events occur
	message = gets().chomp()
	
	# message structure is shown below:
	# customMenuClicked: menu_title menu_item song_url1 song_url2 song_url3 ...
	command = /[A-Za-z]*/.match(message).to_s()
	
	# return the matches with the url and the filetype.
	matches = message.scan(/file:\/\/(\/[^\s]+\.(mp3|ogg|flac))/i)
	
	case command
		when "configure"
			`#{$dialog} --msgbox "This plugin has no configuration."`
		when "customMenuClicked"
			# returns a match object, where [1] will be a string for the match between the brackets in the regex
			# note: $menu_items.join("|") basically or's all possible menu item strings.
			menu_item = /#{command}:\s#{$menu_title}\s(#{$menu_items.join("|")})\s.*$/.match(message)[1]
			
			case menu_item
			when $menu_items[0] # filter selected
				#answer = `#{$dialog} --yesno "This will wipe your current playlist, and then add the top ranked songs.\nContinue?"`
				`#{$dialog} --yesno "This will create a new playlist with the best songs from your selection, with a small degree of randomness.\nThis will clear your current playlist. Are you sure?"`
				if $? == 0
					progress_thread = Thread.new do
						# add backslashes to brackets and remove white space at the end
						$progress_dialog = `#{$dialog} --progressbar "Generating playlist..."`.chomp().gsub(/\(/, "\\(").gsub(/\)/, "\\)")
						progress = 0
						while 1 do
							if progress < 100
								`dcop #{$progress_dialog} setProgress #{progress}`
								progress += 10
								`dcop #{$progress_dialog} setLabel "Generating playlist.  "`
								sleep(0.4)
								`dcop #{$progress_dialog} setLabel "Generating playlist.. "`
								sleep(0.4)
								`dcop #{$progress_dialog} setLabel "Generating playlist..."`
								sleep(0.4)
							else
								`dcop #{$progress_dialog} setLabel "Still working.  "`
								sleep(0.4)
								`dcop #{$progress_dialog} setLabel "Still working.. "`
								sleep(0.4)
								`dcop #{$progress_dialog} setLabel "Still working..."`
								sleep(0.4)
							end
							
						end
					end
					
					#progress_per_match = matches.length/100
					#progress = 0
					songs = Array.new
					
					matches.each do |file|
						# amarok's files are url encoded
						filepath = URI.unescape(file[0])
						# type might be useful later
						filetype = file[1]
						# should work for mp3/ogg/flac tags
						begin
							tag = TagLib::File.new(filepath)
							if tag
								newsong = Song.new(filepath, tag.artist, tag.title)
								newsong.rank = get_song_rank(newsong)
								if newsong.artist && newsong.title && newsong.rank
									songs << newsong
								end
							end
							tag.close
						rescue
							print "error reading tag\n"
						end
					end
					
					# organize the songs by artist
					songs_by_artists = Hash.new
					songs.each do |song|
						if song
							if songs_by_artists["#{song.artist}"] == nil
								songs_by_artists.merge!({"#{song.artist}" => Array.new})
							end
							songs_by_artists["#{song.artist}"] << song
						end
					end
					
					
					total_num_songs = songs.length
					
					songs_string = ''
					top_songs = Array.new
					songs_by_artists.each_pair do |artist,songs_sorted|
						# limit the number of songs you're selecting from each artist
						top_songs_per_artist = (songs_sorted.length/3 > 10) ? 10 : songs_sorted.length/3
						songs_sorted.sort!
						count = 0
						limit_count = 0
						# 100 iterations is a general limit in case it cant find enough songs
						while count <= top_songs_per_artist && limit_count < 100 do
							random = rand(count*3)+1
							if songs_sorted[random]
								tmp_song = songs_sorted[random]
								if !tmp_song.in_array(top_songs)
									top_songs << songs_sorted[random]
									count += 1
								end
							end
							limit_count += 1
						end
					end
					
					in_playlist = Array.new
					if top_songs.length
						`dcop amarok playlist clearPlaylist`
						top_songs.each do |top_song|
							# avoid duplicate songs
							if !top_song.in_array(in_playlist)
								in_playlist << top_song
								url = URI.escape(top_song.file)
								`dcop amarok playlist addMedia "file://#{url}"`
							end
							
						end
					else
						`#{$dialog} --msgbox "Can't find any sweet songs here man. Sorry."`
					end
					`dcop #{$progress_dialog} setProgress 100`
					`dcop #{$progress_dialog} close`
					Thread.kill(progress_thread)
				else
					# answer was no
				end
			when $menu_items[1] # filter selected
				`#{$dialog} --msgbox "This has not been implemented yet. Sorry."`
			end
		else
	end
end