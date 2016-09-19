%% @author Jie LIu
%% @doc @todo Add description to intelDB_util1.
%% update 09/19/2016

-module(intelDB_util1).

%% ====================================================================
%% API functions
%% ====================================================================
-export([getVersion/0]).


-define(VERSION, 1000000).
-define(MAX_FILESIZE, 512*1024*1024).
-define(FILE_PREX, "Files").

getVersion() ->
	%%Var = ?VERSION,
	?FILE_PREX.


ensureDir(Dir, Default) ->
	NewDir =case Dir of
	   "" -> Default;
	   _ -> Dir
	end,
	case filelib:ensure_dir(NewDir) of
         ok -> {ok, NewDir};
         {error, Reason} -> {error, Reason}
    end.



stamptomsecs({MegaSecs,Secs,MicroSecs} = Timestamp) ->
  (MegaSecs*1000000 + Secs)*1000000 + MicroSecs.	
	