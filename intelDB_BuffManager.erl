%% @author jliu4
%% @doc @todo Add description to intelDB_BuffManager.


-module(intelDB_BuffManager).


%% add comment here for client
%% this is last time change
%% this is last2 times change
%% this is last3 times change
%% this is gittest4 last5 times change


-behaviour(gen_server).
-compile(export_all).

-include_lib("stdlib/include/qlc.hrl").

-define(DEF_TEMPDIR, "c:/IntelDB/data/tempBase/").
-define(MEMSTORAGE, memStorage).
-define(MEMHSTDATA, memHstdata).
-define(MAXINDEX, 60000).
-define(MAXMEM, 1024).
-define(BUFFILE, "TempBuff.dat").

-record(record, {
				 time  = 0 :: float, %% the timestampe;
                 value = 0 :: float, %% the value
                 state = 0 :: integer  %% state of the Tag
				 }).

-record(state, {length, realdata = {}, name}).

%% ====================================================================
%% API functions
%% ====================================================================

start() ->
start_link(?MAXINDEX).
	
start_link() -> start_link(?MAXINDEX).

start_link(Length) ->
  gen_server:start_link({local, ?MODULE}, ?MODULE, [Length], []).

stop() ->   	
   gen_server:cast(?MODULE, stop).

start_link(Length, Name) ->
  gen_server:start_link({local, ?MODULE}, ?MODULE, [Length, Name], []).

addRecord(Index, Time, Value, State) ->
  gen_server:call(?MODULE, {addRecord, Index, Time, Value, State}, infinity).

addRecord(Index, Record) ->
  gen_server:call(?MODULE, {addRecord, Index, Record}, infinity).

addData(Index, Time, Value, State) ->
  gen_server:cast(?MODULE, {addData, Index, Time, Value, State}).

getRealTimeData(Index) ->
 gen_server:call(?MODULE, {getRealTimeData, Index}, infinity).

getHistoryData(Index) ->
 gen_server:call(?MODULE, {getHistoryData, Index}, infinity).


moveToTemp(Indexs) ->
  gen_server:cast(?MODULE, {moveToTemp, Indexs}).

%% ====================================================================
%% Internal functions
%% ====================================================================

init([Length]) ->
  init([Length, <<>>]);

init([Length, Name]) ->
  ets:new(?MEMSTORAGE,  [ordered_set, named_table, {keypos, 1}]), 
  TagCount = intelDB_TagBase:getTagCount(),
  [ets:insert(?MEMSTORAGE, [{N, <<>>}]) || N <- lists:seq(0, TagCount)],
  loadFileToBuff(TagCount),
  erlang:send_after(60 * 1000, self(), {gc}),
  State = #state{length = TagCount, name = Name},
  {ok, State}.

handle_call({addRecord, Index, Time, Value, State}, _From, _State) ->
  ets:insert(?MEMSTORAGE, [{Index, <<Time:64/float, Value:64/float, State:8/integer>>}]),
  {reply, ok, _State};

handle_call({addRecord, Index, Record}, _From, State) ->
  ets:insert(?MEMSTORAGE, [{Index, <<(Record#record.time):64/float, (Record#record.value):64/float, (Record#record.state):8/integer>>}]),
  {reply, ok, State};

handle_call({addData, Index, Data}, _From, State) ->
  [{_Idx,  _Data}] = ets:lookup(?MEMHSTDATA, Index),  
  Size = size(_Data),
  Res = 
  if Index == _Idx ->
	 ets:insert(?MEMHSTDATA, [{Index, <<_Data/binary, Data/binary>>}]),
	 ok;
  true -> fail
  end,
  {reply, Res, State};

handle_call({getHistoryData, Index}, _From, State) ->
  Ret =
  case ets:lookup(?MEMHSTDATA, Index) of
	  [{_IdxH, <<_StartTime:64/integer, _EndTime:64/integer, _Data/binary>>}] -> [<<_Data/binary>>];
	  [] -> []
  end,
  {reply, Ret, State};


handle_call({getRealTimeData, Index}, _From, State) ->
  {reply, ets:lookup(?MEMSTORAGE, Index), State}.

handle_cast({addData, Index, Time, Value, State}, _State) ->
  {NTime, NValue, NState} = processRecord(Index, Time, Value, State),
  Data = <<NTime:64/integer, NValue:64/integer, NState:8/integer>>,
  [{_Idx, <<_StartTime:64/integer, _EndTime:64/integer, _Data/binary>>}] = ets:lookup(?MEMHSTDATA, Index),  
  Size = size(_Data) + size(Data),
  StartTime =
  if 
	_StartTime < 0 -> NTime;
	true -> _StartTime
  end,

  if Size > ?MAXMEM ->
	 intelDB_TempManager:addRecordToTemp(Index, NTime, NValue, NState, binary:copy(_Data)),
     ets:update_element(?MEMHSTDATA, Index, {2, <<NTime:64/integer, NTime:64/integer, Data/binary>>});
   true ->	 
	 if Index == _Idx ->
		  ets:update_element(?MEMHSTDATA, Index, {2, <<StartTime:64/integer, NTime:64/integer, _Data/binary, Data/binary>>});
	   true ->
		  fail
	 end
  end,
  intelDB_BuffTrigger:addTagTime(Index),
  ets:update_element(?MEMSTORAGE, Index, {2, <<Data/binary>>}),
  {noreply, _State};

handle_cast({moveToTemp, Indexs}, State) ->
  saveBuffToTemp(Indexs),
  {noreply, State};

handle_cast(stop, State) ->
  saveBuffToFile(),
  {noreply, State};

handle_cast(_Request, State) ->
  {noreply, State}.

terminate(_Reason, State) ->
  ok.

handle_info({gc}, State) ->
   case erlang:memory(binary) of
       % We use more than 500 MB of binary space
       Binary when Binary > 50000000 ->
	       [garbage_collect(Pid) || Pid <- processes()];
       _ ->
           ok
   end,
   erlang:send_after(60 * 1000, self(), {gc}),
   {noreply, State};
   
handle_info(Info, State) ->
  io:format("Other info of: ~p~n", [Info]),
  {noreply, State}.
  
code_change(_OldVsn, State, _Extra) ->
  {ok, State}.

saveBuffToTemp([]) ->
  {ok};

saveBuffToTemp([Index|Indexs]) ->
  moveBuffToTemp(Index),
  saveBuffToTemp(Indexs).

moveBuffToTemp(Index) ->
  [{_IdxH, <<_StartTime:64/integer, _EndTime:64/integer, _Data/binary>>}] = ets:lookup(?MEMHSTDATA, Index), 
  [{_IdxR, <<NTime:64/integer, NValue:64/integer, NState:8/integer>>}] = ets:lookup(?MEMSTORAGE, Index),
  if size(_Data) > 0 ->
     ets:update_element(?MEMHSTDATA, Index, {2, <<-1:64/integer, -1:64/integer>>}),		 
     intelDB_TempManager:addRecordToTemp(Index, NTime, NValue, NState, binary:copy(_Data));
  true ->
	 ok
  end.
  
saveBuffToFile() ->
	BaseDir = ensureBase(),
	FileName = BaseDir ++ ?BUFFILE,
	ets:tab2file(?MEMHSTDATA, FileName).

loadFileToBuff(TagCount) ->
    BaseDir = ensureBase(),
	FileName = BaseDir ++ ?BUFFILE,
	BuffTab = 
	case ets:file2tab(FileName) of
		{ok, Tab} -> Tab;
		{error, Reason} ->
			 ets:new(?MEMHSTDATA,  [ordered_set, named_table, {keypos, 1}]),
		     [ets:insert(?MEMHSTDATA, [{N, <<-1:64/integer, -1:64/integer>>}]) || N <- lists:seq(0, TagCount)],
             ?MEMHSTDATA
    end,
	BuffTab.

ensureBase() ->
	BaseDir = getBaseDir(),
	case intelDB_util:ensureDir(BaseDir, ?DEF_TEMPDIR) of
	 {ok, NewDir} -> NewDir;
	 {error, Reason} ->
	    %% logger the error 'can not create folder for ' + NewDir.
	    stop() 	 
	end.	 
		
getBaseDir() ->
	case application:get_env(intelDB, tempBaseDir) of
		{ok, TempBaseDir} ->
		 TempBaseDir;
		undefined ->
		 ?DEF_TEMPDIR
	end.


			
saveRealData(Index, Time, Value, State) ->
  ets:update_element(?MEMSTORAGE, Index, {2, <<Time:64/float, Value:64/float, State:8/integer>>}).

processRecord(Index, Time, Value, State) ->
	{round(Time), round(Value), State}.
	

printOutRecord(<<>>) ->
	ok;


printOutRecord(<<Time:64/float, Value:64/float, State:8/integer, _Data/binary>>) ->
	 io:format("~n   ~w  ~w ~w  ~n", [Time, Value, State]),
	 printOutRecord(_Data).
	 
addMultiData(N,  Time, Value, State) when N == (?MAXINDEX - 1) ->
   ok;

addMultiData(N,  Time, Value, State) ->
  addData(120,  Time, Value, State),
  addMultiData(N + 1,  Time, Value, State).	

%%%----------------------------------------------------------------------
%%% Testing
%%%----------------------------------------------------------------------
startIntelDB() ->
   application:start(ranch),
   application:start(tcp_echo),
   intelDB_BuffManager:start(),
   intelDB_ArchManager:start(),
   intelDB_Index:start(),
   intelDB_TempManager:start().

addRealRecord(N) when N == (100 - 1) ->
   ok;
	
addRealRecord(N) ->
	Time = 234 + N,
	Value = 1 + N,
	State = 3,
	Data = <<Time:64/float, Value:64/float, State:8/integer>>,
	addMultiData(120, Time, Value, State),
    addRealRecord( N + 1).


cbuf_test() ->
  {ok, I} = start_link(?MAXINDEX),  
  startIntelDB(),  
  addRealRecord(1).


getDataTest(Index) ->
  case getRealTimeData(Index) of   
   [{_Index, <<_Time:64/integer, _Value:64/integer, _State:8/integer>>}] -> {_Time, _Value, _State};
   _ -> Index
  end.
	